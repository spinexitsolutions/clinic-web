import { Fragment } from "react";

/** Minimal, safe markdown: paragraphs, ## / ### headings, - lists, **bold**, *italic*. */
function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="prose-solace">
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith("### ")) return <h3 key={i} className="mb-2 mt-8 text-xl font-medium">{inline(t.slice(4))}</h3>;
        if (t.startsWith("## ")) return <h2 key={i}>{inline(t.slice(3))}</h2>;
        if (t.split("\n").every((l) => /^[-*] /.test(l.trim())))
          return <ul key={i}>{t.split("\n").map((l, k) => <li key={k}>{inline(l.trim().slice(2))}</li>)}</ul>;
        return <p key={i}>{inline(t.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
