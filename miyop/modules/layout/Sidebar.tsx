"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/modules/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { BarChart, FileText, Wrench, Users, ShoppingCart, Package, FolderArchive } from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: ("genel_mudur" | "koordinator" | "sube_muduru" | "muhasebe" | "ik" | "admin")[];
};

const items: MenuItem[] = [
  { label: "Panel", href: "/dashboard", icon: BarChart, roles: ["genel_mudur", "koordinator", "sube_muduru", "muhasebe", "ik", "admin"] },
  { label: "Satış & Finans", href: "/sales", icon: Package, roles: ["genel_mudur", "koordinator", "sube_muduru", "muhasebe", "admin"] },
  { label: "Siparişler", href: "/orders", icon: ShoppingCart, roles: ["genel_mudur", "koordinator", "sube_muduru", "admin"] },
  { label: "Bakım & Talepler", href: "/tickets", icon: Wrench, roles: ["genel_mudur", "koordinator", "sube_muduru", "admin"] },
  { label: "Belge Arşivi", href: "/documents", icon: FolderArchive, roles: ["genel_mudur", "muhasebe", "admin"] },
  { label: "İK & Personel", href: "/hr", icon: Users, roles: ["genel_mudur", "ik", "koordinator", "admin"] },
  { label: "Kullanıcılar", href: "/admin/users", icon: FileText, roles: ["admin"] }
];

export function Sidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const available = items.filter((i) => (profile ? i.roles.includes(profile.role) : false));

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card p-4 md:block">
      <div className="mb-6 text-lg font-semibold">MİYOP</div>
      <nav className="space-y-1">
        {available.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href as any}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                active && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
