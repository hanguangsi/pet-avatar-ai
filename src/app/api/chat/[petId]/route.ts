import { NextResponse } from "next/server";
import { chatAsPet } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { content } = await request.json();
  if (!content) return NextResponse.json({ error: "请输入内容" }, { status: 400 });

  const { data: pet, error: petError } = await supabase.from("pets").select("*").eq("id", petId).eq("user_id", user.id).single();
  if (petError || !pet) return NextResponse.json({ error: "宠物不存在" }, { status: 404 });

  await supabase.from("chat_messages").insert({ user_id: user.id, pet_id: petId, role: "user", content });
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("pet_id", petId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const reply = await chatAsPet(pet, (history || []).reverse());
  await supabase.from("chat_messages").insert({ user_id: user.id, pet_id: petId, role: "assistant", content: reply });

  return NextResponse.json({ content: reply });
}
