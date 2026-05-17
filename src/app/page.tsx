import Link from "next/link";
import { ArrowRight, Camera, Check, ImagePlus, MessageCircle, PawPrint, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1eb]">
      <section className="poster-pop relative min-h-[92vh] overflow-hidden px-5 py-6 text-white md:px-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-black">
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-[#ec2f72]">
              <PawPrint />
            </span>
            萌宠分身 AI
          </Link>
          <Link href="/login" className="rounded-full bg-white px-5 py-2 text-sm font-black text-[#2f241d]">
            开始制作
          </Link>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 pt-16 md:grid-cols-[0.9fr_1.1fr] md:items-center md:pt-20">
          <div className="relative z-10">
            <div className="mb-6 inline-flex rounded-full bg-white px-5 py-2 text-lg font-black text-black">一拍即成</div>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-normal drop-shadow md:text-7xl">
              专属萌宠
              <br />
              数字定格
              <br />
              一键生成宠物形象
            </h1>
            <div className="my-6 h-px max-w-xl bg-white/75" />
            <p className="max-w-2xl text-xl font-semibold leading-9 text-white/90">
              电子档案保存成长 · 定制萌图永久珍藏 · 和你的宠物数字分身聊天
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-[#2f241d] hover:bg-white/90">
                <Link href="/login">
                  立即生成我的萌宠分身
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" className="border border-white bg-transparent text-white hover:bg-white/15">
                <Link href="/dashboard">进入工作台</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[620px] md:min-h-[760px]">
            <PhoneShowcase className="left-0 top-10 -rotate-6" title="专属萌宠" caption="数字定格" tone="pink" />
            <PhoneShowcase className="left-[28%] top-0 rotate-3" title="今日健康分" caption="100%" tone="cream" />
            <PhoneShowcase className="left-[52%] top-56 -rotate-2" title="一拍即成" caption="3D形象" tone="orange" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black md:text-5xl">制作流程</h2>
            <p className="mt-3 text-muted-foreground">像参考图一样，以展示为核心，同时保留真实可用的生成、聊天和健康记录。</p>
          </div>
          <Sparkles className="hidden text-[#ec2f72] md:block" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Camera, title: "上传宠物照片", desc: "选择清晰正脸照，保留毛色、耳朵和眼睛特征。" },
            { icon: ImagePlus, title: "生成 3D 形象", desc: "支持 3D 萌宠、皮克斯、毛绒玩具、节日写真。" },
            { icon: MessageCircle, title: "进入数字陪伴", desc: "保存档案后聊天、健康分和历史记录都会沉淀。" },
          ].map((item) => (
            <Card key={item.title} className="rounded-[2rem] border-0 bg-white poster-card">
              <CardContent className="p-6">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#ffe1eb] text-[#ec2f72]">
                  <item.icon />
                </div>
                <h3 className="text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-[2.5rem] bg-black p-6 text-white md:p-10">
          <h2 className="text-3xl font-black">MVP 定价展示</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["单次生成", "¥3.9", "适合体验一张头像"],
              ["写真包", "¥9.9", "多风格一次生成"],
              ["年会员", "¥99", "无限生成预留"],
            ].map(([name, price, desc]) => (
              <div key={name} className="rounded-[2rem] bg-white p-6 text-[#2f241d]">
                <div className="text-lg font-black">{name}</div>
                <div className="mt-4 text-4xl font-black">{price}</div>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold">
                  <Check className="text-[#ec2f72]" />
                  上线后可接支付
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PhoneShowcase({ className, title, caption, tone }: { className: string; title: string; caption: string; tone: "pink" | "cream" | "orange" }) {
  const toneClass = {
    pink: "bg-[#fff7ee]",
    cream: "bg-[#f5f2ec]",
    orange: "bg-[#fff4df]",
  }[tone];

  return (
    <div className={`poster-card absolute w-[58vw] max-w-[300px] rounded-[2.4rem] bg-white p-3 ${className}`}>
      <div className={`aspect-[9/16] overflow-hidden rounded-[1.9rem] ${toneClass}`}>
        <div className="flex items-center justify-between px-6 pt-6 text-sm font-black text-black">
          <span>9:41</span>
          <span>5G</span>
        </div>
        <div className="px-6 pt-10">
          <p className="text-xl font-black text-black">{title}</p>
          <p className="mt-2 text-5xl font-black leading-none text-[#2f241d]">{caption}</p>
        </div>
        <div className="relative mx-auto mt-8 aspect-square w-[72%] rounded-[2rem] bg-white shadow-xl">
          {tone === "cream" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/assets/hero-pet-duo.png" alt="原创 3D 萌宠形象" className="size-full rounded-[2rem] object-cover" />
          ) : (
            <div className="pet-blob absolute left-1/2 top-1/2 size-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          )}
        </div>
        <div className="mx-6 mt-8 rounded-full bg-[#8b563c] py-4 text-center text-lg font-black text-white">继续</div>
        <div className="mx-6 mt-4 rounded-full bg-[#d7d7d7] py-4 text-center text-lg font-black text-white">重试</div>
      </div>
    </div>
  );
}
