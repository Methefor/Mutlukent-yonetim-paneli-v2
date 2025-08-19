import { ReactNode } from "react";
import SectionLayout from "@/app/(dashboard)/layout";

export default function SalesLayout({ children }: { children: ReactNode }) {
  return <SectionLayout>{children}</SectionLayout>;
}
