import { NextResponse } from "next/server";
import { calculateHealthScore } from "@/lib/health";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const body = await request.json();
  const score = calculateHealthScore({ ...body, hasRecord: true });
  const { data, error } = await supabase
    .from("health_records")
    .insert({
      user_id: user.id,
      pet_id: petId,
      weight: body.weight || null,
      food: body.food || null,
      water: body.water || null,
      poop: body.poop || null,
      exercise: body.exercise || null,
      note: body.note || null,
      health_score: score,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
