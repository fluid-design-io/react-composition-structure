import { useState } from "react"

export type OrderSnapshot = { readonly id: string; readonly items: ReadonlyArray<string> }

export function useOrdersData(initial: OrderSnapshot) {
  const [quantity, setQuantity] = useState(1)
  return {
    state: {
      id: initial.id,
      items: initial.items,
      status: initial.items.length === 0 ? "empty" : "ready",
      quantity
    },
    actions: { increment: () => setQuantity((value) => value + 1) }
  }
}
