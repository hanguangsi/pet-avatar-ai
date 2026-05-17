import Link from "next/link";
import { Bell, Camera, HeartPulse, ImagePlus, MessageCircle, Plus, Search } from "lucide-react";
import { AppShell, EmptyHint, PetAvatarMark } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { healthStatus } from "@/lib/health";
import { createClient } from "@/lib/supabase/server";
import type { HealthRecord, Pet } from "@/lib/types";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: pets = [] } = await supabase.from("pets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const current = (pets as Pet[])[0];
  const { data: latestHealth } = current
    ? await supabase.from("health_records").select("*").eq("pet_id", current.id).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
    : { data: null };
  const score = (latestHealth as HealthRecord | null)?.health_score ?? 100;

  return (
    <AppShell className="max-w-md md:max-w-6xl">
      {!current ? (
        <EmptyHint title="先创建第一只宠物" description="有了档案之后，就可以生成 3D 形象、聊天和记录健康了。" href="/pets" action="新增宠物档案" />
      ) : (
        <div className="mx-auto max-w-md md:max-w-6xl">
          <section className="relative min-h-[430px] overflow-hidden rounded-b-[3rem] bg-[#f4f1eb] pt-3 md:grid md:min-h-[520px] md:grid-cols-[0.9fr_1.1fr] md:items-center md:rounded-[3rem] md:bg-white md:p-10 md:poster-card">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <PetAvatarMark src={current.original_photo_url || current.ai_avatar_url} name={current.name} className="size-20 rounded-full" />
                <div className="flex gap-3">
                  <Link href="/account" className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
                    <Bell />
                  </Link>
                  <Link href="/pets" className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
                    <Plus />
                  </Link>
                </div>
              </div>
              <h1 className="mt-8 text-5xl font-black leading-tight">
                中午好，
                <br />
                {current.name}
              </h1>
              <div className="mt-8 flex gap-4">
                <Link href="/generate" className="flex size-20 items-center justify-center rounded-full bg-white shadow-md">
                  <Search />
                </Link>
                <Link href="/pets" className="flex size-20 items-center justify-center rounded-full bg-white shadow-md">
                  <Plus />
                </Link>
              </div>
            </div>

            <Card className="poster-card relative z-10 mt-8 overflow-visible rounded-[2rem] border-0 bg-white md:mt-0">
              <CardContent className="grid grid-cols-[1fr_1.1fr] items-center p-6">
                <div>
                  <p className="text-xl font-black">今日健康分</p>
                  <div className="mt-3 text-6xl font-black">{score}%</div>
                  <p className="mt-2 font-bold text-emerald-700">{healthStatus(score)}</p>
                  <Button asChild className="mt-8 bg-[#8b563c] text-white hover:bg-[#754832]">
                    <Link href={`/chat/${current.id}`}>和我聊聊</Link>
                  </Button>
                </div>
                <div className="-mr-4">
                  <PetAvatarMark src={current.ai_avatar_url} name={current.name} className="aspect-square rounded-[2rem]" />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mt-8 rounded-t-[3rem] bg-white p-6 poster-card md:rounded-[3rem]">
            <div className="mx-auto mb-8 h-1.5 w-20 rounded-full bg-black/30" />
            <p className="text-lg text-muted-foreground">概览</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { href: "/generate", icon: ImagePlus, title: "生成形象", value: "AI" },
                { href: `/health/${current.id}`, icon: HeartPulse, title: "今日健康", value: String(score) },
                { href: `/chat/${current.id}`, icon: MessageCircle, title: "宠物聊天", value: "在线" },
                { href: "/pets", icon: Camera, title: "宠物档案", value: current.type },
              ].map((item, index) => (
                <Link key={item.title} href={item.href} className={index === 1 ? "rounded-[2rem] bg-[#caa47d] p-5 text-[#2f241d]" : "rounded-[2rem] bg-[#f7f7f5] p-5 text-[#2f241d]"}>
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white">
                    <item.icon />
                  </div>
                  <p className="text-lg font-bold">{item.title}</p>
                  <p className="mt-5 text-4xl font-black">{item.value}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
