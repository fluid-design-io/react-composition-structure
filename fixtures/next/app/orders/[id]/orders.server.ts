import "server-only"
import { cacheLife } from "next/cache"
import { cookies } from "next/headers"
import type { Order } from "./orders.types"

export async function getOrder(id: string): Promise<Order | null> {
  "use cache"
  cacheLife("hours")

  return { id, total: 42, items: ["Card reader", "Receipt paper"] }
}

export async function getViewer() {
  return (await cookies()).get("viewer")?.value ?? null
}
