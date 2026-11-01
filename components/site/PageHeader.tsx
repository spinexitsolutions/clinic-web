import { Reveal, SplitWords } from "@/components/motion/Reveal";

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="container-x pb-12 pt-12 md:pb-20 md:pt-20">
      <Reveal>
        <p className="eyebrow flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {eyebrow}
        </p>
      </Reveal>
      <h1 className="display mt-6 max-w-[15ch] text-[clamp(2.9rem,8.5vw,7.5rem)]">
        <SplitWords text={title} />
        {accent && (
          <>
            {" "}
            <span className="serif-accent text-accent">
              <SplitWords text={accent} delay={0.12} />
            </span>
          </>
        )}
      </h1>
      {(description || children) && (
        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-[1fr_auto] md:items-end">
          {description && (
            <Reveal delay={0.2}>
              <p className="max-w-xl text-[17px] leading-relaxed text-muted md:text-lg">{description}</p>
            </Reveal>
          )}
          {children && <Reveal delay={0.3}>{children}</Reveal>}
        </div>
      )}
    </section>
  );
}
