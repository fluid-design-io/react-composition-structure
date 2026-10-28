import type { PropsWithChildren } from "react"
import { useOrders } from "./orders.context"

export function OrdersEmpty() {
  const { state } = useOrders()
  if (state.status !== "empty") return null
  return <p>No items</p>
}

export function OrdersReady({ children }: PropsWithChildren) {
  const { state } = useOrders()
  if (state.status !== "ready") return null
  return <>{children}</>
}
