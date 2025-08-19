"use client";
import { useState } from "react";
import { z } from "zod";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/modules/auth/AuthProvider";

const schema = z.object({
  category: z.string().min(1),
  title: z.string().min(1)
});

export function TicketForm() {
  const [form, setForm] = useState({ category: "", title: "" });
  const { profile } = useAuth();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast({ title: "Hata", description: "Formu kontrol edin", variant: "destructive" });
    const { error } = await supabase.from("tickets").insert({ ...parsed.data, sube_id: profile?.sube_id, status: "open" });
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
    setForm({ category: "", title: "" });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Input placeholder="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <Input placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Button type="submit">Kaydet</Button>
    </form>
  );
}
