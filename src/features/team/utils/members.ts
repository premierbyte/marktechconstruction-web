export type TeamMember = {
  name: string;
  role: string;
};

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTeamMembers(body: string | null | undefined): TeamMember[] {
  if (!body) {
    return [];
  }

  const members: TeamMember[] = [];
  const pattern = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body)) !== null) {
    const name = stripTags(match[1]);
    const role = stripTags(match[2]);

    if (name) {
      members.push({ name, role });
    }
  }

  return members;
}

export function initials(name: string): string {
  return name
    .replace(/^(Engr|Arc|Surv|Mr|Mrs|Ms|Dr)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
