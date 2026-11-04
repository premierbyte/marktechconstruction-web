import type { Metadata } from "next";
import { RecoveryLoginPanel } from "@/features/admin/auth/components/MfaPanels";

export const metadata: Metadata = { title: "Recovery sign in", robots: { index: false, follow: false } };

export default function AdminRecoveryPage() {
  return <RecoveryLoginPanel />;
}
