"use client";

import { motion, useReducedMotion } from "framer-motion";

export function TypingDots() {
  const reduceMotion = useReducedMotion();

  return (
    <span className="inline-flex items-center gap-1" aria-label="正在输入">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="size-1.5 rounded-full bg-[#8b563c]/60"
          animate={reduceMotion ? undefined : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: index * 0.14 }}
        />
      ))}
    </span>
  );
}
