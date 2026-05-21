"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

type AnimatedScoreProps = {
  score: number;
  suffix?: string;
  className?: string;
};

export function AnimatedScore({ score, suffix = "", className }: AnimatedScoreProps) {
  const reduceMotion = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(reduceMotion ? score : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayScore(score);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const duration = 800;

    function tick(timestamp: number) {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, score]);

  return (
    <span className={className}>
      {displayScore}
      {suffix}
    </span>
  );
}
