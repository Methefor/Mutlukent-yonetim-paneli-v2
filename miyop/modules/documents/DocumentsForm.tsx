"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/modules/auth/AuthProvider";

export function DocumentsForm() {
  const supabase = createBrowserClient();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const path = `${profile?.user_id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (upErr) return toast({ title: "Yükleme hatası", description: upErr.message, variant: "destructive" });
    const { error } = await supabase.from("documents").insert({ path, sube_id: profile?.sube_id });
    if (error) return toast({ title: "Kaydetme hatası", description: error.message, variant: "destructive" });
    toast({ title: "Yüklendi" });
    setFile(null);
  };

  return (
    <form onSubmit={upload} className="flex items-center gap-3">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Button type="submit">Yükle</Button>
    </form>
  );
}
