import type { OrderSnapshot } from "./orders.data"
import { Orders } from "./orders"

export function OrdersScreen({ initial }: { readonly initial: OrderSnapshot }) {
  return (
    <Orders initial={initial}>
      <Orders.Frame>
        <Orders.Header />
        <Orders.Empty />
        <Orders.Ready>
          <Orders.Scroll>
            <Orders.List />
          </Orders.Scroll>
          <Orders.Footer />
        </Orders.Ready>
      </Orders.Frame>
    </Orders>
  )
}
