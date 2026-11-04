import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">404</p>
        <h1 className="display mt-4 text-4xl text-ink">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The page you requested is not available. Return to the public website to continue.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-white hover:bg-forest-soft"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
