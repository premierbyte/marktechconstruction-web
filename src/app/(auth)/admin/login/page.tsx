import type { Metadata } from "next";
import { LoginForm } from "@/features/admin/auth/components/LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <LoginForm />;
}
