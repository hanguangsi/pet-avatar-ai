import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AppShell, PetAvatarMark } from "@/components/app/app-shell";
import { PetForm } from "@/components/app/pet-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Pet } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function PetsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data = [] } = await supabase.from("pets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const pets = data as Pet[];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-black">宠物档案</h1>
        <p className="mt-2 text-muted-foreground">维护基础信息后，AI 分身会更像它。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-4">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <PetAvatarMark src={pet.ai_avatar_url} name={pet.name} className="size-28" />
                <div className="flex-1">
                  <h2 className="text-xl font-black">{pet.name}</h2>
                  <p className="text-sm text-muted-foreground">{pet.type} · {pet.breed || "未知品种"} · {formatDate(pet.birthday)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pet.personality || "还没有填写性格"}</p>
                </div>
                <Button asChild variant="secondary">
                  <Link href={`/chat/${pet.id}`}>
                    <MessageCircle data-icon="inline-start" />
                    聊天
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {pets.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">还没有宠物档案。</CardContent></Card> : null}
        </div>
        <Card className="pet-shadow">
          <CardHeader>
            <CardTitle>新增宠物</CardTitle>
            <CardDescription>第一版先支持新增和更新 API；编辑可在后续接入弹窗。</CardDescription>
          </CardHeader>
          <CardContent>
            <PetForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
