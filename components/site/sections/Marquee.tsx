import { cn } from "@/lib/utils";

function Row({ items, reverse, outline }: { items: string[]; reverse?: boolean; outline?: boolean }) {
  const list = [...items, ...items];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div
        className="animate-marquee flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12"
        style={{ animationDirection: reverse ? "reverse" : "normal", ["--marquee-duration" as string]: `${items.length * 5}s` }}
      >
        {list.map((t, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            <span
              className={cn(
                "font-display whitespace-nowrap text-[clamp(2.4rem,7vw,6rem)] font-semibold leading-none tracking-[-0.025em]",
                outline && "text-transparent [-webkit-text-stroke:1.2px_var(--ink)] opacity-40",
              )}
            >
              {t}
            </span>
            <span className="grid h-[clamp(2.2rem,4.5vw,4rem)] w-[clamp(2.2rem,4.5vw,4rem)] shrink-0 place-items-center rounded-full bg-accent text-[clamp(1rem,2vw,1.6rem)] leading-none text-highlight">✚</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const half = Math.ceil(items.length / 2);
  return (
    <section aria-label="Specialties" className="space-y-3 py-16 md:space-y-5 md:py-28">
      <Row items={items.slice(0, half).concat(items.slice(half))} />
      <Row items={items.slice(half).concat(items.slice(0, half))} reverse outline />
    </section>
  );
}
