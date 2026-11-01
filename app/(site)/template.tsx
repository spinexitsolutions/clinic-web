"use client";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** Page transition: soft veil lifts while the page glides up. Transform/opacity only — stays 60fps. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ scaleX: { duration: 0.7, ease }, opacity: { duration: 0.3, delay: 0.6 } }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[59] bg-bg"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, ease }}
      />
      <motion.div initial={{ y: 28 }} animate={{ y: 0 }} transition={{ duration: 1, ease }}>
        {children}
      </motion.div>
    </>
  );
}
