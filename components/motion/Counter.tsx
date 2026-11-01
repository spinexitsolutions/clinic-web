"use client";
import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 2.2, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
