import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Img } from "../Img";
import { Reveal, SplitWords } from "@/components/motion/Reveal";

export function PostCard({ p, large }: { p: Post; large?: boolean }) {
  return (
    <Link href={`/blog/${p.slug}`} data-cursor="Read" className="group block">
      <div className={`relative overflow-hidden rounded-[var(--radius)] bg-accent-soft ${large ? "aspect-[4/3] md:aspect-[16/11]" : "aspect-[4/3]"}`}>
        <Img src={p.cover} alt={p.title} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105" />
        <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-medium">{p.category}</span>
      </div>
      <div className="mt-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
        <span>{formatDate(p.publishedAt)}</span>
        <span className="h-1 w-1 rounded-full bg-muted" />
        <span>{p.readMinutes} min read</span>
      </div>
      <h3 className={`mt-3 font-medium leading-[1.08] tracking-[-0.03em] transition-colors group-hover:text-accent ${large ? "text-[clamp(1.6rem,3vw,2.4rem)]" : "text-[22px]"}`}>
        {p.title}
      </h3>
      {large && <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-muted">{p.excerpt}</p>}
    </Link>
  );
}

export function Journal({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  const [first, ...rest] = posts;
  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">The journal</p>
          <h2 className="mt-4 text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.025em]">
            <SplitWords text="Notes from" /> <span className="serif-accent text-accent"><SplitWords text="our doctors." delay={0.1} /></span>
          </h2>
        </div>
        <Link href="/blog" className="btn btn-ghost self-start md:self-auto">
          Read the journal <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-10 md:grid-cols-[1.35fr_1fr] md:gap-8">
        <Reveal><PostCard p={first} large /></Reveal>
        <div className="grid gap-10 md:gap-8">
          {rest.slice(0, 2).map((p, i) => (
            <Reveal key={p.id} delay={0.1 + i * 0.1}><PostCard p={p} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
