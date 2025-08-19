"use client";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp(parsed.data);
    setLoading(false);
    if (error) {
      toast({ title: "Kayıt başarısız", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Kayıt başarılı" });
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Kaydol</CardTitle>
          <CardDescription>Yeni kullanıcı oluştur</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="password" placeholder="Şifre" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydol"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
