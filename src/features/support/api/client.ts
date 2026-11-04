import { apiFetch } from "@/lib/http";
import type { SupportOpening, SupportReply } from "../types";

export async function getSupportOpening(): Promise<SupportOpening> {
  const response = await apiFetch<{ data: SupportOpening }>("/api/v1/public/support/opening");

  return response.data;
}

export async function sendSupportMessage(message: string): Promise<SupportReply> {
  const response = await apiFetch<{ data: SupportReply }>("/api/v1/public/support/chat", {
    method: "POST",
    body: { message },
  });

  return response.data;
}