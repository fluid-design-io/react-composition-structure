"use client"

import { useOrdersContext } from "./orders.context"

export function OrdersSummary() {
  const { state, actions } = useOrdersContext()

  return (
    <button onClick={actions.toggle}>
      Total {state.order.total} for {state.viewer ?? "guest"}
    </button>
  )
}

export function OrdersItems() {
  const { state } = useOrdersContext()

  return (
    <ul>
      {state.order.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
