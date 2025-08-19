import { UsersTable } from "@/modules/admin/UsersTable";
import { RequireRole } from "@/modules/auth/RequireRole";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <RequireRole allow={["admin"]}>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
        <UsersTable />
      </div>
    </RequireRole>
  );
}
