export function extractHeadings(body: string | null | undefined): string[] {
  return (body ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => /^##\s+/.test(paragraph))
    .map((paragraph) => paragraph.replace(/^##\s+/, ""));
}

export function headingId(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
