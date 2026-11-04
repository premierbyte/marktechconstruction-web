import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export function FaqsCta() {
  return (
    <div className="mt-14 rounded-2xl bg-forest p-6 text-white sm:p-8">
      <h2 className="display text-2xl">Still have a question?</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
        Send a general enquiry and the team will respond. For a construction
        project, use the project enquiry form so the right details are captured.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/contact" variant="light">
          General enquiry
        </ButtonLink>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white hover:bg-white/10"
          href="/discuss-your-project"
        >
          Discuss your project
        </Link>
      </div>
    </div>
  );
}
