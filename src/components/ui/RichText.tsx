import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const RICH_TEXT_TAGS = ["p", "br", "strong", "b", "em", "i", "h2", "h3", "ul", "ol", "li", "a"] as const;

const ALLOWED = new Set<string>(RICH_TEXT_TAGS);

const HTML_DETECT = /<\/?(p|h2|h3|ul|ol|li|strong|em|b|i|br|a)[\s>/]/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_DETECT.test(value);
}

type Token =
  | { kind: "open"; tag: string; attrs: Record<string, string> }
  | { kind: "close"; tag: string }
  | { kind: "text"; text: string };

type Elem = { tag: string; attrs: Record<string, string>; children: (Elem | string)[] };

const TOKEN_RE = /<([a-zA-Z0-9]+)((?:\s+[^>]*)?)\s*\/?>|<\/([a-zA-Z0-9]+)\s*>|([^<]+)/g;

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&amp;/g, "&");
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    attrs[match[1].toLowerCase()] = decodeEntities(match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(html)) !== null) {
    if (match[1]) {
      const tag = match[1].toLowerCase();
      if (tag === "br") tokens.push({ kind: "open", tag: "br", attrs: {} });
      else tokens.push({ kind: "open", tag, attrs: parseAttrs(match[2] ?? "") });
    } else if (match[3]) {
      tokens.push({ kind: "close", tag: match[3].toLowerCase() });
    } else if (match[4]) {
      tokens.push({ kind: "text", text: decodeEntities(match[4]) });
    }
  }
  return tokens;
}

function buildTree(tokens: Token[]): (Elem | string)[] {
  const root: Elem = { tag: "root", attrs: {}, children: [] };
  const stack: Elem[] = [root];

  for (const token of tokens) {
    const parent = stack[stack.length - 1];

    if (token.kind === "text") {
      parent.children.push(token.text);
    } else if (token.kind === "open") {
      if (!ALLOWED.has(token.tag)) continue;
      const element: Elem = { tag: token.tag, attrs: token.attrs, children: [] };
      parent.children.push(element);
      if (token.tag !== "br") stack.push(element);
    } else {
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tag === token.tag) {
          stack.length = index;
          break;
        }
      }
    }
  }

  return root.children;
}

function toReact(nodes: (Elem | string)[], keyPrefix = "r"): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (typeof node === "string") return node;

    const children = toReact(node.children, key);

    switch (node.tag) {
      case "br":
        return <br key={key} />;
      case "strong":
      case "b":
        return (
          <strong key={key} className="font-semibold text-ink">
            {children}
          </strong>
        );
      case "em":
      case "i":
        return <em key={key}>{children}</em>;
      case "h2":
        return (
          <h2 key={key} className="mt-6 mb-3 text-xl font-bold text-ink">
            {children}
          </h2>
        );
      case "h3":
        return (
          <h3 key={key} className="mt-5 mb-2 text-lg font-semibold text-ink">
            {children}
          </h3>
        );
      case "ul":
        return (
          <ul key={key} className="mb-4 list-disc space-y-1 pl-6">
            {children}
          </ul>
        );
      case "ol":
        return (
          <ol key={key} className="mb-4 list-decimal space-y-1 pl-6">
            {children}
          </ol>
        );
      case "li":
        return <li key={key}>{children}</li>;
      case "a": {
        const href = node.attrs.href ?? "";
        const safe = /^(https?:\/\/|\/|mailto:|tel:)/i.test(href);
        if (!safe) return <span key={key}>{children}</span>;
        const external = /^https?:\/\//i.test(href);
        return (
          <a
            key={key}
            href={href}
            className="font-medium text-forest underline"
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        );
      }
      default:
        return (
          <p key={key} className="mb-4 last:mb-0">
            {children}
          </p>
        );
    }
  });
}

export function RichText({ value, className }: { value?: string | null; className?: string }) {
  if (!value) return null;

  const content = looksLikeHtml(value)
    ? toReact(buildTree(tokenize(value)))
    : value.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">
          {paragraph}
        </p>
      ));

  return <div className={cn("rich-text text-base leading-7 text-muted", className)}>{content}</div>;
}
