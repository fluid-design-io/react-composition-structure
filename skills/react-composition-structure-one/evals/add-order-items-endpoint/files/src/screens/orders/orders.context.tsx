import { createContext, use, type PropsWithChildren } from "react"
import { useOrdersData, type OrderSnapshot } from "./orders.data"

const OrdersContext = createContext<ReturnType<typeof useOrdersData> | null>(null)

export function OrdersProvider({ initial, children }: PropsWithChildren<{ readonly initial: OrderSnapshot }>) {
  const value = useOrdersData(initial)
  return <OrdersContext value={value}>{children}</OrdersContext>
}

export function useOrders() {
  const value = use(OrdersContext)
  if (!value) throw new Error("Orders provider required")
  return value
}
