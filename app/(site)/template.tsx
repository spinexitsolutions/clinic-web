"use client";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** Page transition: a soft accent sheet wipes up as the new page rises in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] origin-top bg-ink"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
        style={{ borderBottomLeftRadius: 48, borderBottomRightRadius: 48 }}
      />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.25 }}>
        {children}
      </motion.div>
    </>
  );
}
