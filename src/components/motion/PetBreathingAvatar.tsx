"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type PetBreathingAvatarProps = {
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  floating?: boolean;
};

const sizeClass = {
  sm: "size-12 rounded-2xl",
  md: "size-14 rounded-2xl",
  lg: "size-24 rounded-[1.75rem]",
  xl: "size-full rounded-[2rem]",
};

export function PetBreathingAvatar({
  imageUrl,
  name,
  size = "md",
  className,
  floating = false,
}: PetBreathingAvatarProps) {
  const reduceMotion = useReducedMotion();
  const src = imageUrl || "/placeholder-pet.svg";

  return (
    <motion.div
      className={cn("overflow-hidden bg-[#fff8ec] shadow-sm", sizeClass[size], className)}
      animate={
        reduceMotion
          ? undefined
          : floating
            ? { y: [0, -8, 0], scale: [1, 1.015, 1] }
            : { scale: [1, 1.025, 1] }
      }
      transition={{ duration: floating ? 3.6 : 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} className="size-full object-cover" />
    </motion.div>
  );
}
