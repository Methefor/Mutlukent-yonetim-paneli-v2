import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Hoş geldiniz</h1>
      <p className="text-muted-foreground">{user?.email}</p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border p-4">Ciro</div>
        <div className="rounded-lg border p-4">Siparişler</div>
        <div className="rounded-lg border p-4">Talepler</div>
        <div className="rounded-lg border p-4">Belgeler</div>
      </div>
    </div>
  );
}
