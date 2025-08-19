import { ReactNode } from "react";
import SectionLayout from "@/app/(dashboard)/layout";

export default function AdminUsersLayout({ children }: { children: ReactNode }) {
  return <SectionLayout>{children}</SectionLayout>;
}
