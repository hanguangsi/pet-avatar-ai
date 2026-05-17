"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMessage, Pet } from "@/lib/types";

export function ChatPanel({ pet, initialMessages }: { pet: Pet; initialMessages: ChatMessage[] }) {
  const [messages, setMessages] = useState(initialMessages.map(({ role, content }) => ({ role, content })));
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setContent("");
    setLoading(true);
    const response = await fetch(`/api/chat/${pet.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    setLoading(false);
    setMessages([...next, { role: "assistant", content: response.ok ? data.content : "我刚刚有点走神了，再摸摸我试试。" }]);
  }

  return (
    <div className="flex min-h-[70vh] flex-col rounded-[2rem] border bg-card p-4 pet-shadow">
      <div className="flex items-center gap-3 border-b pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pet.ai_avatar_url || "/placeholder-pet.svg"} alt={pet.name} className="size-14 rounded-2xl object-cover" />
        <div>
          <h1 className="text-xl font-black">和 {pet.name} 聊天</h1>
          <p className="text-sm text-muted-foreground">{pet.personality || "温暖、可爱、黏人"}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-5">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? <p className="text-center text-sm text-muted-foreground">快和我说第一句话吧。</p> : null}
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === "user" ? "self-end" : "self-start"}>
              <div className={message.role === "user" ? "max-w-[78vw] rounded-[1.5rem] bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground md:max-w-md" : "max-w-[78vw] rounded-[1.5rem] bg-muted px-4 py-3 text-sm leading-6 md:max-w-md"}>
                {message.content}
              </div>
            </div>
          ))}
          {loading ? <div className="self-start rounded-[1.5rem] bg-muted px-4 py-3 text-sm text-muted-foreground">正在摇尾巴组织语言...</div> : null}
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
