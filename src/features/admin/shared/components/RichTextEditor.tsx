"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RICH_TEXT_TAGS } from "@/components/ui/RichText";

const ALLOWED = new Set<string>(RICH_TEXT_TAGS);

function sanitize(html: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  const walk = (node: Element) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) continue;
      if (child.nodeType !== 1) {
        child.remove();
        continue;
      }

      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (!ALLOWED.has(tag)) {
        while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el);
        el.remove();
        continue;
      }

      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        const keep = tag === "a" && name === "href" && /^(https?:\/\/|\/|mailto:|tel:)/i.test(attr.value);
        if (!keep) el.removeAttribute(attr.name);
      }

      if (tag === "a") {
        el.setAttribute("rel", "noopener noreferrer");
        el.setAttribute("target", "_blank");
      }

      walk(el);
    }
  };

  walk(root);
  return root.innerHTML;
}

const TOOLS = [
  { command: "bold", label: "Bold", Icon: Bold },
  { command: "italic", label: "Italic", Icon: Italic },
] as const;

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const empty = !value.replace(/<[^>]*>/g, "").trim();

  useEffect(() => {
    const node = ref.current;
    if (node && document.activeElement !== node && node.innerHTML !== value) {
      node.innerHTML = value;
    }
  }, [value]);

  const commit = () => {
    onChange(ref.current?.innerHTML ?? "");
  };

  const exec = (command: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    commit();
  };

  const formatBlock = (tag: "h2" | "h3" | "p") => exec("formatBlock", tag);

  const addLink = () => {
    const url = window.prompt("Link URL");
    if (!url) return;
    if (!/^(https?:\/\/|\/|mailto:|tel:)/i.test(url)) return;
    exec("createLink", url);
  };

  const clear = () => {
    exec("removeFormat");
    formatBlock("p");
  };

  return (
    <div className="rounded-xl border border-line bg-white focus-within:border-forest/40">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line p-1.5">
        {TOOLS.map(({ command, label, Icon }) => (
          <button
            key={command}
            type="button"
            aria-label={label}
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => exec(command)}
            className="inline-grid size-8 place-items-center rounded-md text-forest hover:bg-forest/5"
          >
            <Icon aria-hidden className="size-4" />
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <button type="button" aria-label="Heading 2" title="Heading 2" onMouseDown={(event) => event.preventDefault()} onClick={() => formatBlock("h2")} className="inline-grid size-8 place-items-center rounded-md text-forest hover:bg-forest/5">
          <Heading2 aria-hidden className="size-4" />
        </button>
        <button type="button" aria-label="Heading 3" title="Heading 3" onMouseDown={(event) => event.preventDefault()} onClick={() => formatBlock("h3")} className="inline-grid size-8 place-items-center rounded-md text-forest hover:bg-forest/5">
          <Heading3 aria-hidden className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <button type="button" aria-label="Bullet list" title="Bullet list" onMouseDown={(event) => event.preventDefault()} onClick={() => exec("insertUnorderedList")} className="inline-grid size-8 place-items-center rounded-md text-forest hover:bg-forest/5">
          <List aria-hidden className="size-4" />
        </button>
        <button type="button" aria-label="Numbered list" title="Numbered list" onMouseDown={(event) => event.preventDefault()} onClick={() => exec("insertOrderedList")} className="inline-grid size-8 place-items-center rounded-md text-forest hover:bg-forest/5">
          <ListOrdered aria-hidden className="size-4" />
        </button>
        <button type="button" aria-label="Add link" title="Add link" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className="inline-grid size-8 place-items-center rounded-md text-forest hover:bg-forest/5">
          <Link2 aria-hidden className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <button type="button" aria-label="Clear formatting" title="Clear formatting" onMouseDown={(event) => event.preventDefault()} onClick={clear} className="inline-grid size-8 place-items-center rounded-md text-forest hover:bg-forest/5">
          <Eraser aria-hidden className="size-4" />
        </button>
      </div>

      <div className="relative">
        {empty ? (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted/70">{placeholder}</span>
        ) : null}
        <div
          id={id}
          ref={ref}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          contentEditable
          suppressContentEditableWarning
          onInput={commit}
          onBlur={() => onChange(sanitize(ref.current?.innerHTML ?? ""))}
          className={cn(
            "min-h-40 px-3 py-2 text-sm leading-7 text-ink outline-none",
            "[&_a]:font-medium [&_a]:text-forest [&_a]:underline",
            "[&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
          )}
        />
      </div>
    </div>
  );
}
