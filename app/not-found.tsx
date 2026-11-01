import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-bg px-6 text-center">
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Error 404</p>
        <h1 className="mt-4 text-[clamp(3rem,12vw,9rem)] font-medium leading-[0.9] tracking-[-0.06em]">
          Lost? <span className="serif-accent text-accent">We&apos;ll guide you.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-muted">The page you&apos;re looking for has moved or never existed.</p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">Back home</Link>
          <Link href="/book" className="btn btn-ghost">Book a visit</Link>
        </div>
      </div>
    </main>
  );
}
