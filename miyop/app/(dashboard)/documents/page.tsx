import { DocumentsForm } from "@/modules/documents/DocumentsForm";
import { DocumentsTable } from "@/modules/documents/DocumentsTable";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Belge Arşivi</h2>
      <DocumentsForm />
      <DocumentsTable />
    </div>
  );
}
