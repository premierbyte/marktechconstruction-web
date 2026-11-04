import type { Metadata } from "next";
import { AdminQueryProvider } from "@/lib/query/provider";
import { AdminShell } from "@/features/admin/shell";
import { requirePrincipal } from "@/features/admin/auth/server";
import { principalKey } from "@/features/admin/auth/keys";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await requirePrincipal();

  return (
    <AdminQueryProvider seed={[{ queryKey: principalKey, data: principal }]}>
      <AdminShell initialPrincipal={principal}>{children}</AdminShell>
    </AdminQueryProvider>
  );
}
