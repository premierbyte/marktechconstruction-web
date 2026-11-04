export type ApiErrorPayload = {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
  request_id?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly errors?: Record<string, string[]>,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isValidation(): boolean {
    return this.status === 422;
  }

  get isStale(): boolean {
    return this.status === 409;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1")}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
}

let csrfReady: Promise<void> | null = null;

export async function ensureCsrf(): Promise<void> {
  if (csrfReady) return csrfReady;

  csrfReady = fetch("/sanctum/csrf-cookie", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  })
    .then(() => undefined)
    .catch(() => {
      csrfReady = null;
    });

  return csrfReady;
}

export async function csrfHeaders(): Promise<Record<string, string>> {
  await ensureCsrf();

  const token = readCookie("XSRF-TOKEN");

  return token ? { "X-XSRF-TOKEN": token } : {};
}

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  raw?: boolean;
  skipCsrf?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };

  if (UNSAFE.has(method) && !options.skipCsrf) {
    Object.assign(headers, await csrfHeaders());
  }

  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(path, {
    method,
    headers,
    body,
    credentials: "same-origin",
    signal: options.signal,
  });

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const error = payload as ApiErrorPayload | null;
    throw new ApiError(
      response.status,
      error?.message ?? `Request failed with status ${response.status}.`,
      error?.code,
      error?.errors,
      error?.request_id,
    );
  }

  return payload as T;
}
