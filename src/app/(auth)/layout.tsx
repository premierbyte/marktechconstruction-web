import type { ReactNode } from "react";
import Image from "next/image";
import { AdminQueryProvider } from "@/lib/query/provider";
import { ThemeToggle } from "@/features/admin/shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AdminQueryProvider>
      <main className="relative grid min-h-screen place-items-center bg-sand px-4 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="Marktech logo"
              width={56}
              height={56}
              className="size-14 object-contain"
              priority
            />
          </div>
          <div className="rounded-3xl border border-line bg-paper p-6 shadow-card sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </AdminQueryProvider>
  );
}