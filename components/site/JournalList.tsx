"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Post } from "@/lib/types";
import { PostCard } from "./sections/Journal";
import { cn } from "@/lib/utils";

export function JournalList({ posts }: { posts: Post[] }) {
  const cats = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const list = posts.filter((p) => cat === "All" || p.category === cat);
  return (
    <>
      <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("relative h-10 shrink-0 rounded-full px-4 text-[14px]", cat === c ? "text-bg" : "text-ink/70 hairline")}>
            {cat === c && <motion.span layoutId="cat" className="absolute inset-0 rounded-full bg-ink" />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} exit={{ opacity: 0 }} className={i === 0 && cat === "All" ? "md:col-span-2" : ""}>
              <PostCard p={p} large={i === 0 && cat === "All"} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
