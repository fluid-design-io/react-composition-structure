import type { PropsWithChildren } from "react"
import { useOrders } from "./orders.context"

export function OrdersFrame({ children }: PropsWithChildren) {
  return <main>{children}</main>
}

export function OrdersHeader() {
  const { state } = useOrders()
  return <h1>Order {state.id}</h1>
}

export function OrdersScroll({ children }: PropsWithChildren) {
  return <section aria-label="Order items" style={{ maxHeight: 240, overflow: "auto" }}>{children}</section>
}

export function OrdersList() {
  const { state } = useOrders()
  return <ul>{state.items.map((item) => <li key={item}>{item}</li>)}</ul>
}
