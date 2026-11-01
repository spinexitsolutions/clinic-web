"use client";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Appearance } from "@/lib/types";

const ease = [0.83, 0, 0.17, 1] as const;
const easeOut = [0.22, 1, 0.36, 1] as const;
const KEY = "solace-intro-seen";

declare global {
  interface Window {
    __introDone?: boolean;
  }
}

export function markIntroDone() {
  window.__introDone = true;
  window.dispatchEvent(new Event("intro:done"));
}

/** Resolves true once the intro has finished (or was skipped). */
export function useIntroDone() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (window.__introDone) return setDone(true);
    const on = () => setDone(true);
    window.addEventListener("intro:done", on);
    return () => window.removeEventListener("intro:done", on);
  }, []);
  return done;
}

type IntroCfg = Appearance["intro"];

/** Inline script — runs before paint so returning visitors never see a flash of the overlay. */
export function IntroGate({ cfg }: { cfg: IntroCfg }) {
  const js = cfg.enabled
    ? `try{if(${cfg.oncePerSession}&&sessionStorage.getItem("${KEY}")){document.documentElement.classList.add("intro-skip")}else{document.documentElement.classList.add("intro-run")}}catch(e){document.documentElement.classList.add("intro-run")}`
    : `document.documentElement.classList.add("intro-skip")`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: js }} />
      <style>{`.intro-skip [data-intro]{display:none!important}.intro-run body{overflow:hidden}`}</style>
    </>
  );
}

export function Intro({ cfg }: { cfg: IntroCfg }) {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState<boolean | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!cfg.enabled || html.classList.contains("intro-skip") || reduce) {
      setSkip(true);
      setVisible(false);
      html.classList.remove("intro-run");
      markIntroDone();
      return;
    }
    setSkip(false);
    const duration = Math.max(1200, Math.min(8000, cfg.durationMs));
    const c = animate(0, 100, { duration: (duration - 500) / 1000, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => setCount(Math.round(v)) });
    const t = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
    }, duration);
    return () => {
      c.stop();
      clearTimeout(t);
    };
  }, [cfg]);

  const finish = () => {
    document.documentElement.classList.remove("intro-run");
    markIntroDone();
  };

  if (skip) return null;

  const word = cfg.word || "Solace";
  const letters = word.split("");

  return (
    <AnimatePresence onExitComplete={finish}>
      {visible && (
        <motion.div
          data-intro
          key="intro"
          className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-ink text-bg"
          exit={
            cfg.style === "curtain"
              ? { opacity: [1, 1, 0], transition: { duration: 1.5, times: [0, 0.7, 1] } }
              : { clipPath: "inset(0 0 100% 0 round 0 0 48px 48px)", transition: { duration: 1.1, ease } }
          }
          initial={{ clipPath: "inset(0 0 0% 0 round 0 0 0px 0px)" }}
        >
          {cfg.style === "curtain" && <Curtains />}

          {/* top bar */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-10 md:pt-8">
            <motion.span className="eyebrow !text-bg/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              Est. 2014
            </motion.span>
            <motion.span className="eyebrow !text-bg/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Bengaluru
            </motion.span>
          </div>

          {/* centre stage */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
            {cfg.style === "pulse" && <Pulse />}

            <h1 className="relative flex overflow-hidden text-[19vw] font-medium leading-[0.9] tracking-[-0.06em] md:text-[12vw]">
              {letters.map((l, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ y: "105%", rotate: cfg.style === "letters" ? 8 : 0 }}
                  animate={{ y: "0%", rotate: 0 }}
                  exit={cfg.style === "letters" ? { y: "-105%", transition: { duration: 0.6, ease, delay: i * 0.03 } } : undefined}
                  transition={{ duration: 1, ease: easeOut, delay: (cfg.style === "pulse" ? 0.75 : 0.25) + i * 0.06 }}
                >
                  {l === " " ? " " : l}
                </motion.span>
              ))}
              <motion.span
                className="mb-[0.12em] ml-[0.05em] inline-block h-[0.16em] w-[0.16em] self-end rounded-full bg-accent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.9 + letters.length * 0.06 }}
              />
            </h1>

            <div className="mt-3 overflow-hidden">
              <motion.p
                className="serif-accent text-2xl text-bg/70 md:text-4xl"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: easeOut, delay: 1.1 }}
              >
                {cfg.tagline}
              </motion.p>
            </div>
          </div>

          {/* bottom: progress */}
          <div className="relative z-10 flex items-end justify-between gap-6 px-5 pb-6 md:px-10 md:pb-10">
            <div className="h-px flex-1 overflow-hidden bg-bg/15">
              <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${count}%` }} />
            </div>
            <span className="font-mono text-5xl tabular-nums tracking-tight md:text-7xl">
              {String(count).padStart(3, "0")}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Pulse() {
  return (
    <svg viewBox="0 0 1200 200" className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 md:h-56" preserveAspectRatio="none" aria-hidden>
      <motion.path
        d="M0 100 L420 100 L445 100 L462 70 L480 128 L505 18 L532 186 L556 100 L600 100 L622 84 L646 100 L1200 100"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: [1, 1, 0.18] }}
        transition={{ pathLength: { duration: 1.3, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 2, times: [0, 0.6, 1] } }}
        style={{ filter: "drop-shadow(0 0 12px var(--accent))" }}
      />
    </svg>
  );
}

function Curtains() {
  return (
    <>
      <motion.div
        className="absolute inset-y-0 left-0 z-20 w-1/2 bg-accent"
        initial={{ x: "-100%" }}
        animate={{ x: "-100%" }}
        exit={{ x: ["-100%", "0%", "0%"], transition: { duration: 1.1, times: [0, 0.45, 1], ease } }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 z-20 w-1/2 bg-accent"
        initial={{ x: "100%" }}
        animate={{ x: "100%" }}
        exit={{ x: ["100%", "0%", "0%"], transition: { duration: 1.1, times: [0, 0.45, 1], ease } }}
      />
    </>
  );
}
