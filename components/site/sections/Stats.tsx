import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import type { HomeContent } from "@/lib/types";

export function Stats({ stats }: { stats: HomeContent["stats"] }) {
  return (
    <section className="container-x py-20 md:py-32">
      <div className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="border-b border-line py-8 pr-4 odd:border-r lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 [&:nth-child(2)]:pl-4 [&:nth-child(4)]:pl-4 lg:[&:nth-child(2)]:pl-8 lg:[&:nth-child(4)]:pl-8">
            <Counter value={s.value} suffix={s.suffix} className="block text-[clamp(2.6rem,6vw,5rem)] font-medium leading-none tracking-[-0.05em] tabular-nums" />
            <p className="mt-3 text-[15px] text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
