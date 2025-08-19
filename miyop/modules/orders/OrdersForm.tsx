"use client";
import { useState } from "react";
import { z } from "zod";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/modules/auth/AuthProvider";

const schema = z.object({
  supplier: z.string().min(1),
  items: z.string().min(1)
});

export function OrdersForm() {
  const [form, setForm] = useState({ supplier: "", items: "" });
  const { profile } = useAuth();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast({ title: "Hata", description: "Formu kontrol edin", variant: "destructive" });
    const { error } = await supabase.from("orders").insert({ ...parsed.data, sube_id: profile?.sube_id });
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
    setForm({ supplier: "", items: "" });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Input placeholder="Tedarikçi/Depo" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
      <Input placeholder="Ürünler" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} />
      <Button type="submit">Kaydet</Button>
    </form>
  );
}
