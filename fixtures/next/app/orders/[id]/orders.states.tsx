"use client"

import type { PropsWithChildren } from "react"
import { useOrdersContext } from "./orders.context"

/** The line items, once the viewer opens the summary. */
export function OrdersExpanded({ children }: PropsWithChildren) {
  const { state } = useOrdersContext()
  if (!state.expanded) return null

  return <>{children}</>
}
