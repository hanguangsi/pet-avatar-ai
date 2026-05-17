"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/browser";

export function AuthPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);
    setMessage(error ? error.message : "登录链接已发送，请查收邮箱。");
  }

  async function tryAnonymously() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) setMessage(error.message);
    else router.push("/dashboard");
  }

  return (
    <Card className="poster-card mx-auto max-w-md rounded-[2rem] border-0 bg-white">
      <CardHeader>
        <CardTitle>登录或先体验</CardTitle>
        <CardDescription>邮箱登录会保存宠物档案；匿名体验可生成 1 次。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <Button disabled={!email || loading} onClick={signInWithEmail}>
          <Mail data-icon="inline-start" />
          发送登录链接
        </Button>
        <Button variant="secondary" disabled={loading} onClick={tryAnonymously}>
          <Sparkles data-icon="inline-start" />
          匿名体验一次
        </Button>
        {message ? <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
