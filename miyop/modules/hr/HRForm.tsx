"use client";
import { useState } from "react";
import { z } from "zod";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/modules/auth/AuthProvider";

const schema = z.object({
  staff_name: z.string().min(1),
  movement: z.string().min(1)
});

export function HRForm() {
  const [form, setForm] = useState({ staff_name: "", movement: "" });
  const { profile } = useAuth();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast({ title: "Hata", description: "Formu kontrol edin", variant: "destructive" });
    const { error } = await supabase.from("hr_records").insert({ ...parsed.data, sube_id: profile?.sube_id });
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    toast({ title: "Kaydedildi" });
    setForm({ staff_name: "", movement: "" });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Input placeholder="Personel" value={form.staff_name} onChange={(e) => setForm({ ...form, staff_name: e.target.value })} />
      <Input placeholder="Hareket" value={form.movement} onChange={(e) => setForm({ ...form, movement: e.target.value })} />
      <Button type="submit">Kaydet</Button>
    </form>
  );
}
