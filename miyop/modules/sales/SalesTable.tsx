"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/modules/auth/AuthProvider";

type Row = { id: string; date: string; ciro: number; z_rapor_no: string; sube_id: string | null };

export function SalesTable() {
  const supabase = createBrowserClient();
  const { profile } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("sales").select("id, date, ciro, z_rapor_no, sube_id").order("date", { ascending: false }).limit(50);
      if (profile && profile.role === "sube_muduru") {
        query = query.eq("sube_id", profile.sube_id);
      }
      const { data } = await query;
      setRows((data as any) ?? []);
    };
    load();
  }, [supabase, profile]);

  const filtered = rows.filter((r) =>
    [r.date, String(r.ciro), r.z_rapor_no, r.sube_id ?? ""].some((v) => v.toString().toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex justify-end">
        <input
          className="h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 text-sm"
          placeholder="Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left">
            <th className="p-2">Tarih</th>
            <th className="p-2">Ciro</th>
            <th className="p-2">Z Rapor No</th>
            <th className="p-2">Şube</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.ciro}</td>
              <td className="p-2">{r.z_rapor_no}</td>
              <td className="p-2">{r.sube_id ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
