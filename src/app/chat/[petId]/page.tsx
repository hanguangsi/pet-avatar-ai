import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ChatPanel } from "@/components/app/chat-panel";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, Pet } from "@/lib/types";

export default async function ChatPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const user = await requireUser();
  const supabase = await createClient();
  const { data: pet } = await supabase.from("pets").select("*").eq("id", petId).eq("user_id", user.id).single();
  if (!pet) notFound();
  const { data: messages = [] } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("pet_id", petId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <AppShell className="max-w-3xl">
      <ChatPanel pet={pet as Pet} initialMessages={messages as ChatMessage[]} />
    </AppShell>
  );
}
