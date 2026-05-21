import { notFound } from "next/navigation";
import { HealthForm } from "@/components/app/health-form";
import { AppShell } from "@/components/app/app-shell";
import { AnimatedScore } from "@/components/motion/AnimatedScore";
import { FadeInCard } from "@/components/motion/FadeInCard";
import { GrowthTimeline } from "@/components/motion/GrowthTimeline";
import { PetBreathingAvatar } from "@/components/motion/PetBreathingAvatar";
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

  const typedPet = pet as Pet;
  const { data: records = [] } = await supabase
    .from("health_records")
    .select("*")
    .eq("pet_id", petId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const typedRecords = records as HealthRecord[];
  const latest = typedRecords[0];
  const score = latest?.health_score ?? 90;
  const petImage = typedPet.ai_avatar_url || typedPet.original_photo_url || "/placeholder-pet.svg";

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <FadeInCard delay={0}>
          <Card className="pet-shadow">
            <CardContent className="p-5">
              <PetBreathingAvatar imageUrl={petImage} name={typedPet.name} size="xl" className="aspect-square" />
              <h1 className="mt-5 text-3xl font-black">{typedPet.name}</h1>
              <p className="text-muted-foreground">
                健康分：
                <AnimatedScore score={score} /> · {healthStatus(score)}
              </p>
              <Progress className="mt-4" value={score} />
            </CardContent>
          </Card>
        </FadeInCard>

        <FadeInCard delay={0.08}>
          <Card className="pet-shadow">
            <CardHeader>
              <CardTitle>记录今日健康</CardTitle>
              <CardDescription>评分用于日常观察，不替代兽医诊断。</CardDescription>
            </CardHeader>
            <CardContent>
              <HealthForm petId={petId} />
            </CardContent>
          </Card>
        </FadeInCard>
      </div>

      <FadeInCard delay={0.16} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>最近记录</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthTimeline records={typedRecords} petName={typedPet.name} petImage={petImage} />
          </CardContent>
        </Card>
      </FadeInCard>
    </AppShell>
  );
}
