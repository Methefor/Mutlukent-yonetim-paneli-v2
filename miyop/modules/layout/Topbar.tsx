"use client";
import { useAuth } from "@/modules/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { profile, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background px-4">
      <div className="font-medium">{profile?.sube_id ? `Şube: ${profile.sube_id}` : "Genel"}</div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">{profile?.name}</div>
        <Button size="sm" variant="outline" onClick={signOut}>
          Çıkış
        </Button>
      </div>
    </header>
  );
}
