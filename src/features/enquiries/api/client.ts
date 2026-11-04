import { csrfHeaders } from "@/lib/http";
import type { EnquiryAttempt, EnquiryReceipt, EnquirySubmitResult } from "../types";

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function createEnquiryAttempt(): Promise<EnquiryAttempt> {
  const response = await fetch("/api/v1/public/enquiry-attempts", {
    method: "POST",
    headers: { Accept: "application/json", ...(await csrfHeaders()) },
    credentials: "same-origin",
  });

  const body = (await readJson(response)) as { data?: EnquiryAttempt; message?: string } | null;

  if (!response.ok || !body?.data) {
    throw new Error(body?.message || "The enquiry form could not be prepared. Try again.");
  }

  return body.data;
}

export async function submitEnquiry(
  payload: Record<string, unknown>,
): Promise<EnquirySubmitResult> {
  const response = await fetch("/api/v1/public/enquiries", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(await csrfHeaders()),
    },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });

  const body = (await readJson(response)) as
    | { data?: EnquiryReceipt; message?: string; errors?: Record<string, string[]> }
    | null;

  if (response.ok && body?.data) {
    return {
      ok: true,
      status: response.status === 201 ? 201 : 200,
      receipt: body.data,
    };
  }

  return {
    ok: false,
    status: response.status,
    message: body?.message || "The enquiry could not be submitted. Try again.",
    errors: body?.errors,
  };
}
