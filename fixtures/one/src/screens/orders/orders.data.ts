import { useState } from "react"
import { useLoaderState } from "one"

export type OrderSnapshot = { readonly id: string; readonly items: ReadonlyArray<string> }

export function useOrdersData(initial: OrderSnapshot) {
  const [quantity, setQuantity] = useState(1)
  const { refetch, state } = useLoaderState()
  return {
    state: {
      id: initial.id,
      items: initial.items,
      status: initial.items.length === 0 ? "empty" : "ready",
      quantity,
      refreshing: state === "loading"
    },
    actions: {
      increment: () => setQuantity((value) => value + 1),
      refresh: refetch
    }
  }
}
