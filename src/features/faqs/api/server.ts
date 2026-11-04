import { getFaqs, type Faq } from "@/features/content";

export type FaqGroup = [string, Faq[]];

export function groupFaqs(faqs: Faq[]): FaqGroup[] {
  const groups = new Map<string, Faq[]>();

  faqs.forEach((faq) => {
    const category = faq.category || "General";
    groups.set(category, [...(groups.get(category) ?? []), faq]);
  });

  return [...groups.entries()];
}

export type FaqsContent = {
  faqs: Faq[];
  groups: FaqGroup[];
  hasDemo: boolean;
};

export async function getFaqsContent(): Promise<FaqsContent> {
  const faqs = await getFaqs();

  return {
    faqs,
    groups: groupFaqs(faqs),
    hasDemo: faqs.some((faq) => faq.demo),
  };
}
