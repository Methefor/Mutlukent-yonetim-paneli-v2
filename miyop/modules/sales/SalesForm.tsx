"use client";
import { useState } from "react";
import { z } from "zod";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/modules/auth/AuthProvider";

const schema = z.object({
  date: z.string().min(1),
  ciro: z.coerce.number().min(0),
  z_rapor_no: z.string().min(1)
});

export function SalesForm() {
  const [form, setForm] = useState({ date: "", ciro: "", z_rapor_no: "" });
  const { profile } = useAuth();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, ciro: Number(form.ciro) });
    if (!parsed.success) return toast({ title: "Hata", description: "Formu kontrol edin", variant: "destructive" });
    const { error } = await supabase.from("sales").insert({ ...parsed.data, sube_id: profile?.sube_id });
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
    setForm({ date: "", ciro: "", z_rapor_no: "" });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <Input
        type="number"
        placeholder="Ciro"
        value={form.ciro}
        onChange={(e) => setForm({ ...form, ciro: e.target.value })}
      />
      <Input
        placeholder="Z Rapor No"
        value={form.z_rapor_no}
        onChange={(e) => setForm({ ...form, z_rapor_no: e.target.value })}
      />
      <Button type="submit">Kaydet</Button>
    </form>
  );
}
