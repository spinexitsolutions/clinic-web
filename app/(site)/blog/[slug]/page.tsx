import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { ParallaxImage } from "@/components/motion/Parallax";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { Markdown } from "@/components/site/Markdown";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { PostCard } from "@/components/site/sections/Journal";
import { Newsletter } from "@/components/site/forms/Newsletter";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await readDb()).posts.find((x) => x.slug === slug && x.published);
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: [p.cover] } } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const db = await readDb();
  const p = db.posts.find((x) => x.slug === slug && x.published);
  if (!p) notFound();
  const author = db.doctors.find((d) => d.name === p.author);
  const more = db.posts.filter((x) => x.published && x.id !== p.id).slice(0, 2);
  return (
    <article>
      <ReadingProgress />
      <header className="container-x pt-36 text-center md:pt-48">
        <Reveal>
          <Link href="/blog" className="eyebrow hover:text-ink">← Journal</Link>
          <div className="mt-8 flex items-center justify-center gap-3 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-accent-deep">{p.category}</span>
            <span>{formatDate(p.publishedAt)}</span>
            <span>· {p.readMinutes} min</span>
          </div>
        </Reveal>
        <h1 className="display mx-auto mt-8 max-w-[18ch] text-[clamp(2.4rem,6.5vw,5.6rem)]"><SplitWords text={p.title} /></h1>
        <Reveal delay={0.2}><p className="mx-auto mt-6 max-w-xl text-lg text-muted">{p.excerpt}</p></Reveal>
        <Reveal delay={0.25} className="mt-8 inline-flex items-center gap-3">
          {author ? (
            <Link href={`/doctors/${author.slug}`} className="text-[15px]">By <span className="font-medium underline-offset-4 hover:underline">{p.author}</span></Link>
          ) : (
            <span className="text-[15px]">By <span className="font-medium">{p.author}</span></span>
          )}
        </Reveal>
      </header>
      <div className="px-3 pt-12 md:px-5 md:pt-16">
        <ParallaxImage src={p.cover} alt={p.title} priority className="h-[50svh] rounded-[var(--radius)] md:h-[75vh]" />
      </div>
      <div className="container-x py-16 md:py-24">
        <div className="mx-auto max-w-[680px]">
          <Markdown source={p.content} />
          <div className="mt-16 rounded-[var(--radius)] bg-ink p-6 text-bg md:p-8">
            <p className="text-2xl font-medium tracking-[-0.03em]">Get the next one in your inbox.</p>
            <div className="mt-5"><Newsletter dark /></div>
          </div>
        </div>
      </div>
      {more.length > 0 && (
        <section className="container-x pb-24 md:pb-36">
          <p className="eyebrow mb-8">Keep reading</p>
          <div className="grid gap-10 md:grid-cols-2">{more.map((m) => <PostCard key={m.id} p={m} />)}</div>
        </section>
      )}
    </article>
  );
}
