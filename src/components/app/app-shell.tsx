import Link from "next/link";
import { HeartPulse, Home, ImagePlus, PawPrint, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "工作台", icon: Home },
  { href: "/pets", label: "宠物", icon: PawPrint },
  { href: "/generate", label: "生成", icon: ImagePlus },
  { href: "/account", label: "我的", icon: UserRound },
];

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[#f4f1eb]">
      <header className="sticky top-0 z-20 bg-[#f4f1eb]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-black tracking-normal">
            <span className="flex size-10 items-center justify-center rounded-full bg-black text-white">
              <PawPrint data-icon="inline-start" />
            </span>
            <span>萌宠分身 AI</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-white hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:py-10", className)}>{children}</main>
      <nav className="fixed inset-x-0 bottom-5 z-30 px-4 md:hidden">
        <div className="glass-nav mx-auto grid max-w-sm grid-cols-4 gap-1 rounded-full border border-white/70 p-2">
          {nav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-full px-2 py-2 text-xs font-semibold text-[#2f3038]",
                index === 0 && "bg-black text-white",
              )}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PetAvatarMark({ src, name, className }: { src?: string | null; name?: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] bg-white", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src || "/placeholder-pet.svg"} alt={name || "宠物形象"} className="size-full object-cover" />
    </div>
  );
}

export function EmptyHint({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <div className="rounded-[2.5rem] bg-white p-8 text-center poster-card">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f3e4d2] text-primary">
        <HeartPulse />
      </div>
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href={href} className="mt-5 inline-flex rounded-full bg-[#8b563c] px-5 py-3 text-sm font-bold text-white">
        {action}
      </Link>
    </div>
  );
}
