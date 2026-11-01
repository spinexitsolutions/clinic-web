"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

export function SmoothScroll({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 1.4 });
    lenisInstance = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
