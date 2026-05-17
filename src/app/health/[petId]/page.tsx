import { notFound } from "next/navigation";
import { HealthForm } from "@/components/app/health-form";
import { AppShell, PetAvatarMark } from "@/components/app/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { healthStatus } from "@/lib/health";
import { createClient } from "@/lib/supabase/server";
import type { HealthRecord, Pet } from "@/lib/types";

export default async function HealthPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const user = await requireUser();
  const supabase = await createClient();
  const { data: pet } = await supabase.from("pets").select("*").eq("id", petId).eq("user_id", user.id).single();
  if (!pet) notFound();
  const { data: records = [] } = await supabase
    .from("health_records")
    .select("*")
    .eq("pet_id", petId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const latest = (records as HealthRecord[])[0];
  const score = latest?.health_score ?? 90;

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="pet-shadow">
          <CardContent className="p-5">
            <PetAvatarMark src={(pet as Pet).ai_avatar_url} name={(pet as Pet).name} className="aspect-square" />
            <h1 className="mt-5 text-3xl font-black">{(pet as Pet).name}</h1>
            <p className="text-muted-foreground">健康分：{score} · {healthStatus(score)}</p>
            <Progress className="mt-4" value={score} />
          </CardContent>
        </Card>
        <Card className="pet-shadow">
          <CardHeader>
            <CardTitle>记录今日健康</CardTitle>
            <CardDescription>评分用于日常观察，不替代兽医诊断。</CardDescription>
          </CardHeader>
          <CardContent>
            <HealthForm petId={petId} />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>最近记录</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {(records as HealthRecord[]).map((record) => (
            <div key={record.id} className="rounded-2xl bg-muted p-4 text-sm">
              <div className="font-bold">{new Date(record.created_at).toLocaleString("zh-CN")} · {record.health_score} 分</div>
              <div className="mt-2 text-muted-foreground">饮食 {record.food || "-"} / 饮水 {record.water || "-"} / 排便 {record.poop || "-"} / 运动 {record.exercise || "-"}</div>
              {record.note ? <div className="mt-1 text-muted-foreground">备注：{record.note}</div> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
