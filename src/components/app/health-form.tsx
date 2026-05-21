"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HealthForm({ petId }: { petId: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [savedPulse, setSavedPulse] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/health/${petId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, weight: payload.weight ? Number(payload.weight) : null }),
    });

    setLoading(false);
    if (response.ok) {
      setMessage("今天的陪伴已记录。");
      setSavedPulse(true);
      window.setTimeout(() => setSavedPulse(false), 520);
      router.refresh();
    } else {
      setMessage("保存失败，请稍后重试");
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      className="grid gap-4 md:grid-cols-2"
      animate={savedPulse && !reduceMotion ? { scale: [1, 1.015, 1] } : undefined}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      {[
        ["weight", "体重 kg", "number", "4.2"],
        ["food", "饮食", "text", "正常 / 少量 / 拒食"],
        ["water", "饮水", "text", "正常 / 不足"],
        ["poop", "排便", "text", "正常 / 稀 / 硬 / 异常"],
        ["exercise", "运动", "text", "30 分钟散步"],
      ].map(([id, label, type, placeholder]) => (
        <div key={id} className="flex flex-col gap-2">
          <Label htmlFor={id}>{label}</Label>
          <Input id={id} name={id} type={type} step={type === "number" ? "0.1" : undefined} placeholder={placeholder} />
        </div>
      ))}
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="note">备注</Label>
        <Textarea id="note" name="note" placeholder="疫苗、驱虫、精神状态或其他观察" />
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button disabled={loading}>
          <Activity data-icon="inline-start" />
          {loading ? "保存中" : "保存健康记录"}
        </Button>
        {message ? (
          <motion.span
            className="rounded-full bg-[#fff3df] px-3 py-1.5 text-sm font-medium text-[#8b563c]"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {message}
          </motion.span>
        ) : null}
      </div>
    </motion.form>
  );
}
