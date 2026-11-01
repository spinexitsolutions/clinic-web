import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";
/** Slim specialties band: fixed label, items ticking past behind an edge fade. */
export function Marquee({ items, heading }: { items: string[]; heading?: Partial<SectionHeading> }) {
  const H = headingFor("marquee", heading);
  if (!items.length) return null;
  const list = [...items, ...items];
  return (
    <section aria-label="Specialties" className="px-2 py-10 md:px-3 md:py-14">
      <div className="relative flex h-[76px] items-center overflow-hidden rounded-full bg-ink text-bg md:h-[92px]">
        <div className="relative z-10 flex h-full shrink-0 items-center pl-2 pr-3 md:pl-3 md:pr-6">
          <span className="flex h-[56px] items-center gap-3 rounded-full bg-accent pl-2 pr-5 text-accent-ink md:h-[68px] md:pr-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-highlight font-display text-[15px] font-semibold text-ink md:h-[52px] md:w-[52px] md:text-[18px]">
              {items.length}
            </span>
            <span className="text-[12px] font-semibold uppercase leading-tight tracking-[0.14em] md:text-[13px]">
              {H.eyebrow}
              {H.intro && <span className="hidden font-normal normal-case tracking-normal text-accent-ink/70 md:block">{H.intro}</span>}
            </span>
          </span>
        </div>
        <div className="relative flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div
            className="animate-marquee flex shrink-0 items-center"
            style={{ ["--marquee-duration" as string]: `${items.length * 4.5}s` }}
          >
            {list.map((t, i) => (
              <span key={i} className="flex items-center">
                <span className="whitespace-nowrap px-6 font-display text-[22px] font-medium tracking-[-0.02em] text-bg/90 md:px-9 md:text-[28px]">
                  {t}
                </span>
                <span aria-hidden className="text-[18px] font-light text-highlight md:text-[22px]">+</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
