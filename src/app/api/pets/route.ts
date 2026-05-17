import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(request: Request) {
  const { supabase, user } = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const body = await request.json();
  const { error, data } = await supabase
    .from("pets")
    .insert({
      user_id: user.id,
      name: body.name,
      type: body.type,
      breed: body.breed || null,
      gender: body.gender || null,
      birthday: body.birthday || null,
      weight: body.weight || null,
      personality: body.personality || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { supabase, user } = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const body = await request.json();
  const { error, data } = await supabase
    .from("pets")
    .update({
      name: body.name,
      type: body.type,
      breed: body.breed || null,
      gender: body.gender || null,
      birthday: body.birthday || null,
      weight: body.weight || null,
      personality: body.personality || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
