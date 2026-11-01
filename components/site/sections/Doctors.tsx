import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { Doctor } from "@/lib/types";
import { Img } from "../Img";
import { cn } from "@/lib/utils";

export function DoctorCard({ d, className }: { d: Doctor; className?: string }) {
  return (
    <Link
      href={`/doctors/${d.slug}`}
      data-cursor="Profile"
      className={cn("group relative block aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-accent-soft", className)}
    >
      <Img
        src={d.image}
        alt={d.name}
        fill
        sizes="(max-width:768px) 75vw, 25vw"
        className="object-cover grayscale-[35%] transition-all duration-[1.1s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
      <span className="glass absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium">
        <Star className="h-3 w-3 fill-[#F5A524] text-[#F5A524]" /> {d.rating.toFixed(1)}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">{d.specialty}</p>
        <h3 className="mt-1.5 text-[18px] font-medium leading-tight tracking-[-0.03em] md:text-[22px]">{d.name}</h3>
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="pt-2 text-[13px] text-white/70">{d.experience}+ yrs · {d.languages.slice(0, 3).join(", ")}</p>
          </div>
        </div>
      </div>
      <span className="absolute right-3 top-3 grid h-9 w-9 scale-75 place-items-center rounded-full bg-white text-ink opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export { DoctorsBoard as Doctors } from "./DoctorsBoard";
