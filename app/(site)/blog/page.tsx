import type { Metadata } from "next";
import { readDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { JournalList } from "@/components/site/JournalList";

export const metadata: Metadata = { title: "Journal", description: "Health advice from the doctors at Solace." };

export default async function BlogPage() {
  const db = await readDb();
  const posts = db.posts.filter((p) => p.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <PageHeader eyebrow="The journal" title="Clear answers," accent="from real doctors." description="No scare-stories, no miracle cures. Just evidence-based advice, written by the people who'd treat you." />
      <section className="container-x pb-24 md:pb-36"><JournalList posts={posts} /></section>
    </>
  );
}
