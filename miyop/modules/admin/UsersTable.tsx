"use client";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuth, UserRole } from "@/modules/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Row = { id: string; user_id: string; name: string | null; role: UserRole; sube_id: string | null; email?: string | null };

export function UsersTable() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { profile } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id, user_id, name, role, sube_id");
    const userIds = (profiles ?? []).map((p: any) => p.user_id);
    const { data: users } = await supabase.from("users_view").select("id, email").in("id", userIds);
    const emailById = new Map((users ?? []).map((u: any) => [u.id, u.email]));
    setRows(
      (profiles ?? []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        name: p.name,
        role: p.role,
        sube_id: p.sube_id,
        email: emailById.get(p.user_id) ?? null
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promote = async (row: Row, role: UserRole) => {
    if (!profile || (profile.role !== "admin" && profile.role !== "genel_mudur")) return;
    const { error } = await supabase.from("profiles").update({ role }).eq("id", row.id);
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    toast({ title: "Güncellendi" });
    load();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left">
            <th className="p-2">Email</th>
            <th className="p-2">Ad</th>
            <th className="p-2">Rol</th>
            <th className="p-2">Şube</th>
            <th className="p-2">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.email}</td>
              <td className="p-2">{r.name ?? "-"}</td>
              <td className="p-2">{r.role}</td>
              <td className="p-2">{r.sube_id ?? "-"}</td>
              <td className="p-2 space-x-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={() => promote(r, "admin")}>Admin</Button>
                <Button size="sm" variant="outline" disabled={loading} onClick={() => promote(r, "genel_mudur")}>Genel Müdür</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
