import Link from "next/link";
import { Check } from "lucide-react";
import type { Package } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { Reveal, SplitWords } from "@/components/motion/Reveal";

export function PackageGrid({ packages, currency }: { packages: Package[]; currency: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {packages.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.1}>
          <article
            className={cn(
              "relative flex h-full flex-col rounded-[var(--radius)] p-7 md:p-8",
              p.highlighted ? "bg-ink text-bg shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] md:-translate-y-4" : "bg-card hairline",
            )}
          >
            {p.highlighted && (
              <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-accent-ink">
                Most booked
              </span>
            )}
            <h3 className="text-[22px] font-medium tracking-[-0.03em]">{p.name}</h3>
            <p className={cn("mt-2 text-[15px]", p.highlighted ? "text-bg/60" : "text-muted")}>{p.tagline}</p>
            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-[52px] font-medium leading-none tracking-[-0.025em]">{money(p.price, currency)}</span>
              {p.compareAt > p.price && (
                <span className={cn("text-[15px] line-through", p.highlighted ? "text-bg/40" : "text-muted")}>{money(p.compareAt, currency)}</span>
              )}
            </div>
            <ul className="mt-8 space-y-3 border-t border-current/10 pt-6 text-[15px]">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", p.highlighted ? "bg-accent text-accent-ink" : "bg-accent-soft text-accent")}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className={p.highlighted ? "text-bg/85" : ""}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/book?package=${p.id}`}
              className={cn("btn mt-auto w-full translate-y-0 pt-0", p.highlighted ? "btn-accent" : "btn-primary")}
              style={{ marginTop: "2rem" }}
            >
              Book {p.name}
            </Link>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function Packages({ packages, currency }: { packages: Package[]; currency: string }) {
  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-12 text-center md:mb-20">
        <p className="eyebrow">Health checkups</p>
        <h2 className="mx-auto mt-4 max-w-[16ch] text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.025em]">
          <SplitWords text="Prevention," /> <span className="serif-accent text-accent"><SplitWords text="priced honestly." delay={0.1} /></span>
        </h2>
      </div>
      <PackageGrid packages={packages} currency={currency} />
    </section>
  );
}
