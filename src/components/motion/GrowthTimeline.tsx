"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PetBreathingAvatar } from "@/components/motion/PetBreathingAvatar";
import type { HealthRecord } from "@/lib/types";

type GrowthTimelineProps = {
  records: HealthRecord[];
  petName: string;
  petImage?: string | null;
};

export function GrowthTimeline({ records, petName, petImage }: GrowthTimelineProps) {
  const reduceMotion = useReducedMotion();

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] bg-muted/60 px-6 py-12 text-center">
        <PetBreathingAvatar imageUrl={petImage} name={petName} size="lg" floating />
        <p className="mt-5 text-sm font-medium text-muted-foreground">还没有成长记录，今天开始为它留下第一条吧。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {records.map((record, index) => {
        const isLatest = index === 0;

        return (
          <motion.div
            key={record.id}
            className="relative pl-8"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: "easeOut", delay: index * 0.08 }}
          >
            <motion.span
              className={
                isLatest
                  ? "absolute left-0 top-5 size-3 rounded-full bg-[#d68a53] ring-4 ring-[#fff3df]"
                  : "absolute left-0 top-5 size-3 rounded-full bg-[#d6b28a]/80"
              }
              initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
              animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.08 + 0.08 }}
            />
            {index < records.length - 1 ? <span className="absolute left-[5px] top-9 h-[calc(100%-1rem)] w-px bg-[#ead8c6]" /> : null}
            <div className={isLatest ? "rounded-2xl bg-[#fff8ec] p-4 text-sm shadow-sm" : "rounded-2xl bg-muted p-4 text-sm"}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">
                  {new Date(record.created_at).toLocaleString("zh-CN")} · {record.health_score} 分
                </div>
                {isLatest ? <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#8b563c]">最新</span> : null}
              </div>
              <div className="mt-2 text-muted-foreground">
                饮食 {record.food || "-"} / 饮水 {record.water || "-"} / 排便 {record.poop || "-"} / 运动 {record.exercise || "-"}
              </div>
              {record.note ? <div className="mt-1 text-muted-foreground">备注：{record.note}</div> : null}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
