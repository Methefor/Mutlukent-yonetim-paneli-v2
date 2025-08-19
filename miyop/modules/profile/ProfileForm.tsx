"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/modules/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function ProfileForm() {
  const supabase = createBrowserClient();
  const { profile, refresh } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? "");
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let avatar_url = profile?.avatar_url ?? null;
    if (file && profile) {
      const path = `${profile.user_id}/avatar-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
      if (upErr) {
        setLoading(false);
        return toast({ title: "Yükleme hatası", description: upErr.message, variant: "destructive" });
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatar_url = data.publicUrl;
    }

    const { error } = await supabase.from("profiles").update({ name, avatar_url }).eq("id", profile?.id);
    setLoading(false);
    if (error) return toast({ title: "Güncelleme hatası", description: error.message, variant: "destructive" });
    toast({ title: "Güncellendi" });
    refresh();
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</Button>
      </div>
    </form>
  );
}
