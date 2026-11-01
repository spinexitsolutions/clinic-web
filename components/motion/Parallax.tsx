"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { Img } from "@/components/site/Img";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Image that drifts inside its frame as you scroll. */
export function ParallaxImage({
  src,
  alt,
  className,
  amount = 12,
  sizes = "100vw",
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  amount?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y, scale: 1 + amount / 50 }} className="absolute inset-0">
        <Img src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </motion.div>
    </div>
  );
}
