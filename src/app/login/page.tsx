import Link from "next/link";
import { PawPrint } from "lucide-react";
import { AuthPanel } from "@/components/app/auth-panel";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#f4f1eb] md:grid-cols-[1.05fr_0.95fr]">
      <section className="poster-pop relative overflow-hidden px-6 py-8 text-white md:min-h-screen md:px-10 md:py-10">
        <Link href="/" className="relative z-10 flex items-center gap-2 text-lg font-black">
          <span className="flex size-10 items-center justify-center rounded-full bg-white text-[#ec2f72]">
            <PawPrint />
          </span>
          萌宠分身 AI
        </Link>

        <div className="relative z-10 mt-12 md:mt-20">
          <div className="inline-flex rounded-full bg-white px-5 py-2 text-2xl font-black text-black md:text-4xl">一拍即成</div>
          <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
            专属萌宠
            <br />
            3D形象
          </h1>
          <div className="my-5 h-px max-w-xl bg-white/80" />
          <p className="max-w-xl text-xl font-semibold leading-8 text-white/90">登录后保存档案、聊天历史和健康记录，让爱宠拥有自己的数字分身。</p>
        </div>

        <div className="poster-card relative z-10 mx-auto mt-10 max-w-sm rotate-3 rounded-[2.5rem] bg-white p-4 md:mt-14">
          <div className="aspect-square overflow-hidden rounded-[2rem] bg-[#fff8ec]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/hero-pet-duo.png" alt="原创 3D 萌宠形象" className="size-full object-cover" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-4xl font-black">开始创建萌宠分身</h2>
            <p className="mt-3 text-muted-foreground">先体验一次，满意后再完善宠物档案。</p>
          </div>
          <AuthPanel />
        </div>
      </section>
    </main>
  );
}
