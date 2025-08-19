"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/modules/auth/AuthProvider";

type Row = { id: string; created_at: string; supplier: string; items: string; sube_id: string | null };

export function OrdersTable() {
  const supabase = createBrowserClient();
  const { profile } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("orders").select("id, created_at, supplier, items, sube_id").order("created_at", { ascending: false }).limit(50);
      if (profile && profile.role === "sube_muduru") {
        query = query.eq("sube_id", profile.sube_id);
      }
      const { data } = await query;
      setRows((data as any) ?? []);
    };
    load();
  }, [supabase, profile]);

  const filtered = rows.filter((r) =>
    [new Date(r.created_at).toLocaleString(), r.supplier, r.items, r.sube_id ?? ""].some((v) =>
      v.toString().toLowerCase().includes(search.toLowerCase())
    )
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
            <th className="p-2">Tedarikçi</th>
            <th className="p-2">Ürünler</th>
            <th className="p-2">Şube</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-2">{r.supplier}</td>
              <td className="p-2">{r.items}</td>
              <td className="p-2">{r.sube_id ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
