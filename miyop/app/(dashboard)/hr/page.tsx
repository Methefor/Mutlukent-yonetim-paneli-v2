import { HRForm } from "@/modules/hr/HRForm";
import { HRTable } from "@/modules/hr/HRTable";

export default function HRPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">İK & Personel</h2>
      <HRForm />
      <HRTable />
    </div>
  );
}
