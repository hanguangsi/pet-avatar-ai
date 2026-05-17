import { AppShell } from "@/components/app/app-shell";
import { GeneratePanel } from "@/components/app/generate-panel";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Pet } from "@/lib/types";

export default async function GeneratePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data = [] } = await supabase.from("pets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <AppShell className="max-w-md md:max-w-6xl">
      <section className="poster-pop relative -mx-4 -mt-6 overflow-hidden px-5 py-10 text-white md:mx-0 md:rounded-[3rem] md:p-10">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="inline-flex rounded-full bg-white px-5 py-2 text-3xl font-black text-black md:text-5xl">一拍即成</div>
          <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
            专属萌宠
            <br />
            3D形象
          </h1>
          <div className="my-5 h-px max-w-3xl bg-white/80" />
          <p className="text-xl font-semibold text-white/90">定格爱宠模样 · 定制独一无二的数字伙伴</p>
        </div>
      </section>
      <div className="relative z-10 -mt-10">
        <GeneratePanel pets={data as Pet[]} />
      </div>
    </AppShell>
  );
}
