import { OrdersForm } from "@/modules/orders/OrdersForm";
import { OrdersTable } from "@/modules/orders/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Tedarik/Depo Siparişleri</h2>
      <OrdersForm />
      <OrdersTable />
    </div>
  );
}
