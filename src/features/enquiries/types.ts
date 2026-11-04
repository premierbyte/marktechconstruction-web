export type EnquiryReceipt = {
  reference: string;
  received_at: string;
  expected_response_window?: string | null;
  notification_status?: string;
};

export type EnquiryAttempt = {
  attempt_token: string;
  expires_at: string;
};

export type EnquirySubmitResult =
  | { ok: true; status: 200 | 201; receipt: EnquiryReceipt }
  | { ok: false; status: number; message: string; errors?: Record<string, string[]> };
