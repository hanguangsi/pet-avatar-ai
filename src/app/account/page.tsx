import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ImageGeneration } from "@/lib/types";

export default async function AccountPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("image_generations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);
  const history = (data || []) as ImageGeneration[];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-black">我的页面</h1>
        <p className="mt-2 text-muted-foreground">{user.email || "匿名体验用户"}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="pet-shadow">
          <CardHeader>
            <CardTitle>使用次数</CardTitle>
            <CardDescription>基础付费能力预留，当前免费额度 1 次。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">{history.length}</div>
            <Badge className="mt-4">Free</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>生成历史</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-muted p-3">
                <div className="aspect-square overflow-hidden rounded-[1.2rem] bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.result_image_url || item.source_image_url || "/placeholder-pet.svg"} alt={item.style} className="size-full object-cover" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold">{item.style}</span>
                  <Badge>{item.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
