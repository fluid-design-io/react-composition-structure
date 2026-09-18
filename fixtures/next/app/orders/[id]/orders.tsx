import type { PropsWithChildren } from "react"
import { OrdersProvider } from "./orders.context"
import { OrdersItems, OrdersSummary } from "./orders.display"
import { getOrder, getViewer } from "./orders.server"
import { OrdersSkeleton } from "./orders.skeleton"
import { OrdersExpanded } from "./orders.states"

type OrdersRootProps = PropsWithChildren<{ params: Promise<{ id: string }> }>

async function OrdersRoot({ params, children }: OrdersRootProps) {
  const { id } = await params
  const [order, viewer] = await Promise.all([getOrder(id), getViewer()])
  if (!order) return <p>No such order.</p>

  return <OrdersProvider seed={{ order, viewer }}>{children}</OrdersProvider>
}

export const Orders = Object.assign(OrdersRoot, {
  Summary: OrdersSummary,
  Items: OrdersItems,
  Expanded: OrdersExpanded,
  Skeleton: OrdersSkeleton,
})
