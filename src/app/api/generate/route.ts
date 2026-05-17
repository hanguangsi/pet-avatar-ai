import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePetAvatar, buildPetImagePrompt } from "@/lib/openai";

const bucket = "pet-media";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录或匿名体验" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("photo");
  const petId = String(form.get("petId") || "");
  const style = String(form.get("style") || "3D萌宠");
  const extra = String(form.get("extra") || "");
  if (!(file instanceof File)) return NextResponse.json({ error: "请上传宠物照片" }, { status: 400 });

  const { count } = await supabase
    .from("image_generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "succeeded");
  const isPaid = false;
  if (!isPaid && (count || 0) >= 1) {
    return NextResponse.json({ error: "免费额度已用完，付费生成预留中。" }, { status: 402 });
  }

  const ext = file.name.split(".").pop() || "png";
  const basePath = `${user.id}/${crypto.randomUUID()}`;
  const sourcePath = `${basePath}/source.${ext}`;
  const resultPath = `${basePath}/avatar.png`;

  const sourceBuffer = Buffer.from(await file.arrayBuffer());
  const sourceUpload = await supabase.storage.from(bucket).upload(sourcePath, sourceBuffer, {
    contentType: file.type || "image/png",
    upsert: false,
  });
  if (sourceUpload.error) return NextResponse.json({ error: sourceUpload.error.message }, { status: 400 });
  const sourceImageUrl = supabase.storage.from(bucket).getPublicUrl(sourcePath).data.publicUrl;

  const generation = await supabase
    .from("image_generations")
    .insert({
      user_id: user.id,
      pet_id: petId || null,
      style,
      prompt: buildPetImagePrompt(style, extra),
      source_image_url: sourceImageUrl,
      status: "pending",
    })
    .select()
    .single();

  try {
    const output = await generatePetAvatar({ file, style, extra, sourceImageUrl });
    const resultUpload = await supabase.storage.from(bucket).upload(resultPath, output, {
      contentType: "image/png",
      upsert: false,
    });
    if (resultUpload.error) throw resultUpload.error;
    const resultImageUrl = supabase.storage.from(bucket).getPublicUrl(resultPath).data.publicUrl;

    await supabase
      .from("image_generations")
      .update({ status: "succeeded", result_image_url: resultImageUrl })
      .eq("id", generation.data?.id);

    if (petId) {
      await supabase
        .from("pets")
        .update({ original_photo_url: sourceImageUrl, ai_avatar_url: resultImageUrl, updated_at: new Date().toISOString() })
        .eq("id", petId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ resultImageUrl, sourceImageUrl });
  } catch (error) {
    await supabase.from("image_generations").update({ status: "failed" }).eq("id", generation.data?.id);
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成失败" }, { status: 500 });
  }
}
