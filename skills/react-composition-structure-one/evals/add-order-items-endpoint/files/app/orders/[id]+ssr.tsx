import { useLoader, type LoaderProps } from "one"
import { OrdersScreen } from "@/screens/orders"

export async function loader({ params }: LoaderProps<{ id: string }>) {
  const { readOrder } = await import("@/server/orders.server")
  return readOrder(params.id)
}

export default function OrdersRoute() {
  const initial = useLoader(loader)
  return <OrdersScreen initial={initial} />
}
