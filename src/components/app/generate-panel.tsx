"use client";

import { FormEvent, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Pet } from "@/lib/types";

const styles = ["3D萌宠", "皮克斯风", "毛绒玩具", "节日写真", "Q版头像"];

export function GeneratePanel({ pets }: { pets: Pet[] }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    const response = await fetch("/api/generate", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    setLoading(false);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "生成失败");
      return;
    }
    setResult(data.resultImageUrl);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <Card className="poster-card rotate-[-1.5deg] rounded-[2.5rem] border-0 bg-[#fff8ec]">
        <CardHeader className="p-7">
          <CardTitle className="text-2xl">为你的宠物制作专属形象</CardTitle>
          <CardDescription>上传宠物照片，选择风格后生成 1:1 专属 3D 萌宠分身。</CardDescription>
        </CardHeader>
        <CardContent className="p-7 pt-0">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="petId">保存到宠物</Label>
              <select id="petId" name="petId" className="h-12 rounded-[1.5rem] border bg-white px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">暂不关联</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="photo">宠物照片</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" required className="bg-white" />
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {styles.map((style) => (
                <label key={style} className="flex cursor-pointer items-center justify-center rounded-full border bg-white px-3 py-3 text-center text-sm font-black has-[:checked]:border-[#8b563c] has-[:checked]:bg-[#8b563c] has-[:checked]:text-white">
                  <input className="sr-only" type="radio" name="style" value={style} defaultChecked={style === "3D萌宠"} />
                  {style}
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="extra">额外描述</Label>
              <Textarea id="extra" name="extra" className="bg-white" placeholder="例如：戴浅蓝色小围巾，背景更干净，表情开心一点" />
            </div>
            {error ? <p className="rounded-[1.5rem] bg-[#ffe1eb] px-4 py-3 text-sm font-semibold text-[#a53055]">{error}</p> : null}
            <Button size="lg" disabled={loading} className="h-14 bg-[#8b563c] text-white hover:bg-[#754832]">
              {loading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <ImagePlus data-icon="inline-start" />}
              {loading ? "生成中，请稍候" : "生成我的萌宠分身"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="poster-card rotate-[1.5deg] rounded-[2.5rem] border-0 bg-white">
        <CardHeader className="p-7">
          <CardTitle className="text-2xl">生成结果</CardTitle>
          <CardDescription>结果会自动写入生成历史；选择宠物后会同步更新头像。</CardDescription>
        </CardHeader>
        <CardContent className="p-7 pt-0">
          <div className="aspect-square overflow-hidden rounded-[2rem] bg-[#fff8ec]">
            {result ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result} alt="生成结果" className="size-full object-cover" />
            ) : (
              <div className="poster-pop flex size-full items-center justify-center p-8">
                <div className="relative aspect-square w-[78%] rotate-3 rounded-[2rem] bg-white shadow-2xl">
                  <div className="pet-blob absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                </div>
              </div>
            )}
          </div>
          {result ? (
            <a href={result} target="_blank" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8b563c] px-5 py-3 text-sm font-bold text-white">
              <Save data-icon="inline-start" />
              查看原图
            </a>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">生成前会展示参考风格图，生成后替换为你的宠物分身。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
