"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Soft cursor follower. Grows over interactive elements and shows a label
 * for anything with `data-cursor="View"`.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<{ hover: boolean; label: string }>({ hover: false, label: "" });
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const interactive = t?.closest("a,button,[role=button],input,select,textarea,label");
      setState((prev) => {
        const next = { hover: !!(labelled || interactive), label: labelled?.dataset.cursor ?? "" };
        return prev.hover === next.hover && prev.label === next.label ? prev : next;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;
  const size = state.label ? 88 : state.hover ? 44 : 12;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden items-center justify-center rounded-full md:flex"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: size,
        height: size,
        backgroundColor: state.label ? "var(--accent)" : state.hover ? "rgba(0,0,0,0)" : "var(--ink)",
        borderWidth: state.hover && !state.label ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="absolute inset-0 rounded-full border border-ink/40" style={{ opacity: state.hover && !state.label ? 1 : 0 }} />
      {state.label && <span className="text-[11px] font-medium uppercase tracking-wider text-accent-ink">{state.label}</span>}
    </motion.div>
  );
}
