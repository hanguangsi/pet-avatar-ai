"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Pet } from "@/lib/types";

export function PetForm({ pet }: { pet?: Pet }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/pets", {
      method: pet ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pet?.id, ...payload, weight: payload.weight ? Number(payload.weight) : null }),
    });
    setLoading(false);
    if (!response.ok) {
      setError((await response.json()).error || "保存失败");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={pet?.id || ""} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">名字</Label>
        <Input id="name" name="name" defaultValue={pet?.name} placeholder="奶盖" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">类型</Label>
        <select id="type" name="type" defaultValue={pet?.type || "猫"} className="h-11 rounded-2xl border bg-card px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option>猫</option>
          <option>狗</option>
          <option>其他</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="breed">品种</Label>
        <Input id="breed" name="breed" defaultValue={pet?.breed || ""} placeholder="英短 / 柯基 / 田园" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="gender">性别</Label>
        <Input id="gender" name="gender" defaultValue={pet?.gender || ""} placeholder="妹妹 / 弟弟" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="birthday">生日</Label>
        <Input id="birthday" name="birthday" type="date" defaultValue={pet?.birthday || ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="weight">体重 kg</Label>
        <Input id="weight" name="weight" type="number" step="0.1" defaultValue={pet?.weight || ""} placeholder="4.2" />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="personality">性格</Label>
        <Textarea id="personality" name="personality" defaultValue={pet?.personality || ""} placeholder="黏人、胆小、爱撒娇、喜欢窗边晒太阳" />
      </div>
      {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          <Save data-icon="inline-start" />
          {loading ? "保存中" : "保存档案"}
        </Button>
      </div>
    </form>
  );
}
