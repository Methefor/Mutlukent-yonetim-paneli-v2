import { TicketForm } from "@/modules/tickets/TicketForm";
import { TicketsTable } from "@/modules/tickets/TicketsTable";

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bakım & Talepler</h2>
      <TicketForm />
      <TicketsTable />
    </div>
  );
}
