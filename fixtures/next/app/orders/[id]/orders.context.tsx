"use client"

import { createContext, use, useState, type PropsWithChildren } from "react"
import type { Order } from "./orders.types"

type OrdersSeed = { order: Order; viewer: string | null }

type OrdersContextValue = {
  state: OrdersSeed & { expanded: boolean }
  actions: { toggle: () => void }
  meta: Record<string, never>
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

export function useOrdersContext() {
  const value = use(OrdersContext)
  if (!value) throw new Error("useOrdersContext must be used inside <Orders>")
  return value
}

export function OrdersProvider({ seed, children }: PropsWithChildren<{ seed: OrdersSeed }>) {
  const [expanded, setExpanded] = useState(false)
  const value: OrdersContextValue = {
    state: { ...seed, expanded },
    actions: { toggle: () => setExpanded((open) => !open) },
    meta: {},
  }

  return <OrdersContext value={value}>{children}</OrdersContext>
}
