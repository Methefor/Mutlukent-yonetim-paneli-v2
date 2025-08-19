import { ReactNode } from "react";
import Protected from "@/modules/auth/Protected";
import { Sidebar } from "@/modules/layout/Sidebar";
import { Topbar } from "@/modules/layout/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </Protected>
  );
}
