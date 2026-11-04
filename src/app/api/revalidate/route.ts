import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8192;
const MAX_AGE_SECONDS = 300;
const EVENT_TTL_MS = MAX_AGE_SECONDS * 2 * 1000;
const MAX_TRACKED_EVENTS = 2048;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Coarse resource tags. The publisher's signed payload carries the document
// type and identifier; public fetches use the type/listing tags and the 60s
// fallback TTL bounds any residual staleness.
const TYPE_TAGS: Record<string, string[]> = {
  settings: ["settings", "public-content"],
  service: ["services", "public-content"],
  sector: ["sectors", "public-content"],
  project: ["projects", "public-content"],
  content_page: ["content", "pages", "public-content"],
  content_faq: ["content", "faqs", "public-content"],
  credibility_testimonial: ["credentials", "public-content"],
  credibility_credential: ["credentials", "public-content"],
  insight: ["insights", "public-content"],
  vacancy: ["careers", "public-content"],
};

const FALLBACK_TAGS = ["public-content"];

const seenEvents = new Map<string, number>();

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function validSignature(secret: string, timestamp: string, body: string, signature: string): boolean {
  const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

function hasSeenEvent(eventId: string): boolean {
  const expiresAt = seenEvents.get(eventId);

  if (expiresAt === undefined) return false;

  if (expiresAt <= Date.now()) {
    seenEvents.delete(eventId);
    return false;
  }

  return true;
}

function rememberEvent(eventId: string): void {
  const now = Date.now();

  for (const [id, expiresAt] of seenEvents) {
    if (expiresAt > now) break;
    seenEvents.delete(id);
  }

  if (seenEvents.size >= MAX_TRACKED_EVENTS) {
    const oldest = seenEvents.keys().next().value;

    if (oldest !== undefined) seenEvents.delete(oldest);
  }

  seenEvents.set(eventId, now + EVENT_TTL_MS);
}

function allowedType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(TYPE_TAGS, type);
}

function deriveTags(type: string, documentId: string | null): string[] {
  const tags = new Set<string>([...FALLBACK_TAGS, ...(TYPE_TAGS[type] ?? [])]);

  if (documentId !== null) tags.add(`document:${documentId}`);

  return [...tags];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.REVALIDATION_SECRET;

  if (!secret) {
    return json({ message: "Revalidation is not configured." }, 503);
  }

  const timestamp = request.headers.get("x-invalidation-timestamp") ?? "";
  const signature = request.headers.get("x-invalidation-signature") ?? "";
  const body = await request.text();

  if (body.length === 0 || Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    return json({ message: "Invalid payload size." }, 400);
  }

  const parsedTimestamp = Number.parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(parsedTimestamp) || Math.abs(now - parsedTimestamp) > MAX_AGE_SECONDS) {
    return json({ message: "Stale or invalid timestamp." }, 401);
  }

  if (!validSignature(secret, timestamp, body, signature)) {
    return json({ message: "Invalid signature." }, 401);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    return json({ message: "Invalid JSON body." }, 400);
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return json({ message: "Invalid payload." }, 400);
  }

  const record = payload as Record<string, unknown>;
  const eventId = typeof record.event_id === "string" ? record.event_id : "";
  const type = typeof record.type === "string" ? record.type : "";
  const documentId = typeof record.document_id === "string" ? record.document_id : null;

  if (!ID_PATTERN.test(eventId)) {
    return json({ message: "Missing or invalid event identifier." }, 400);
  }

  if (!allowedType(type)) {
    return json({ message: "Unsupported resource type." }, 400);
  }

  if (record.document_id !== undefined && (documentId === null || !ID_PATTERN.test(documentId))) {
    return json({ message: "Invalid document identifier." }, 400);
  }

  if (hasSeenEvent(eventId)) {
    return json({ revalidated: true, duplicate: true, event_id: eventId });
  }

  const tags = deriveTags(type, documentId);

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  revalidatePath("/sitemap.xml");
  rememberEvent(eventId);

  return json({ revalidated: true, tags, event_id: eventId });
}
