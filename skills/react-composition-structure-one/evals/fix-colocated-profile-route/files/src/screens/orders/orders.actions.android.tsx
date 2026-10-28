import { One } from "one"
import { useOrders } from "./orders.context"

export function OrdersFooter() {
  const { state, actions } = useOrders()
  return (
    <One.Android.Column style={{ width: "100%", height: 80 }} composeStyle={{ padding: 12 }}>
      <One.Android.Button
        label={`Quantity ${state.quantity}`}
        onPress={actions.increment}
        composeStyle={{ fillMaxWidth: true }}
      />
    </One.Android.Column>
  )
}
