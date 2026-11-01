"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Doctor, Service } from "@/lib/types";
import { DoctorCard } from "./sections/Doctors";
import { cn } from "@/lib/utils";

export function DoctorsDirectory({ doctors, services }: { doctors: Doctor[]; services: Service[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const used = services.filter((s) => doctors.some((d) => d.serviceIds.includes(s.id)));
  const list = useMemo(
    () =>
      doctors.filter(
        (d) =>
          (filter === "all" || d.serviceIds.includes(filter)) &&
          (q === "" || `${d.name} ${d.specialty} ${d.languages.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [doctors, filter, q],
  );

  return (
    <section className="container-x pb-24 md:pb-36">
      <div className="sticky top-[84px] z-20 -mx-2 mb-8 flex flex-col gap-3 rounded-[24px] p-2 glass md:flex-row md:items-center">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {[{ id: "all", name: "All" }, ...used].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn("relative h-10 shrink-0 rounded-full px-4 text-[14px] transition-colors", filter === s.id ? "text-bg" : "text-ink/70 hover:text-ink")}
            >
              {filter === s.id && <motion.span layoutId="doc-filter" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />}
              <span className="relative">{s.name}</span>
            </button>
          ))}
        </div>
        <label className="flex h-10 items-center gap-2 rounded-full bg-white px-4 hairline md:ml-auto md:w-64">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or language" className="w-full bg-transparent text-[14px] outline-none" />
        </label>
      </div>

      <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((d) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <DoctorCard d={d} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-20 text-center text-muted">No doctors match that search.</p>}
    </section>
  );
}
