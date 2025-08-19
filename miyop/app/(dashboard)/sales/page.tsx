import { SalesForm } from "@/modules/sales/SalesForm";
import { SalesTable } from "@/modules/sales/SalesTable";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Günlük Ciro & Z-Raporu</h2>
      <SalesForm />
      <SalesTable />
    </div>
  );
}
