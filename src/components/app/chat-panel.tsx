"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PetBreathingAvatar } from "@/components/motion/PetBreathingAvatar";
import { TypingDots } from "@/components/motion/TypingDots";
import type { ChatMessage, Pet } from "@/lib/types";

const moodTags = ["想你啦", "开心", "陪着你", "撒娇中"];

type LocalMessage = Pick<ChatMessage, "role" | "content">;

function moodFor(content: string, index: number) {
  return moodTags[(content.length + index) % moodTags.length];
}

export function ChatPanel({ pet, initialMessages }: { pet: Pet; initialMessages: ChatMessage[] }) {
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages.map(({ role, content }) => ({ role, content })));
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const petImage = pet.ai_avatar_url || pet.original_photo_url || "/placeholder-pet.svg";
  const petTone = useMemo(() => pet.personality || "温暖、可爱、黏人", [pet.personality]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || loading) return;

    const userContent = content.trim();
    const next = [...messages, { role: "user" as const, content: userContent }];
    setMessages(next);
    setContent("");
    setLoading(true);

    const response = await fetch(`/api/chat/${pet.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: userContent }),
    });
    const data = await response.json();

    setLoading(false);
    setMessages([...next, { role: "assistant", content: response.ok ? data.content : "我刚刚有点走神了，再摸摸我试试。" }]);
  }

  return (
    <div className="flex min-h-[70vh] flex-col rounded-[2rem] border bg-card p-4 pet-shadow">
      <div className="flex items-center gap-3 border-b pb-4">
        <PetBreathingAvatar imageUrl={petImage} name={pet.name} size="md" />
        <div>
          <h1 className="text-xl font-black">和 {pet.name} 聊天</h1>
          <p className="text-sm text-muted-foreground">{petTone}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex min-h-[44vh] flex-col items-center justify-center text-center">
              <PetBreathingAvatar imageUrl={petImage} name={pet.name} size="lg" floating />
              <p className="mt-5 text-sm font-medium text-muted-foreground">今天想和 {pet.name} 聊些什么呢？</p>
            </div>
          ) : null}

          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <motion.div
                  key={`${message.role}-${index}-${message.content}`}
                  className={isUser ? "self-end" : "self-start"}
                  initial={reduceMotion ? false : { opacity: 0, x: isUser ? 18 : -18, y: 8 }}
                  animate={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  {!isUser ? (
                    <div className="mb-1 ml-1 inline-flex rounded-full bg-[#fff3df] px-2.5 py-1 text-[11px] font-bold text-[#8b563c]">
                      {moodFor(message.content, index)}
                    </div>
                  ) : null}
                  <div
                    className={
                      isUser
                        ? "max-w-[78vw] rounded-[1.5rem] bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground md:max-w-md"
                        : "max-w-[78vw] rounded-[1.5rem] bg-muted px-4 py-3 text-sm leading-6 md:max-w-md"
                    }
                  >
                    {message.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading ? (
            <motion.div
              className="self-start rounded-[1.5rem] bg-muted px-4 py-3 text-sm text-muted-foreground"
              initial={reduceMotion ? false : { opacity: 0, x: -12, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <span className="mr-2">{pet.name} 正在想怎么回答你…</span>
              <TypingDots />
            </motion.div>
          ) : null}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t pt-4">
        <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder={`对 ${pet.name} 说点什么`} />
        <Button type="submit" size="icon" disabled={loading}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
