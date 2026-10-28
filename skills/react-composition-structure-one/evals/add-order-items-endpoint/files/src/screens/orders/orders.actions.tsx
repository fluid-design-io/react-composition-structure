import { useOrders } from "./orders.context"

export function OrdersFooter() {
  const { state, actions } = useOrders()
  return <footer><button onClick={actions.increment}>Quantity {state.quantity}</button></footer>
}
