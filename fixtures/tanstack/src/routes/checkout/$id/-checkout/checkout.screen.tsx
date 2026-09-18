import { Checkout } from "./checkout"

export function CheckoutScreen() {
  return (
    <Checkout>
      <Checkout.Offline />
      <Checkout.Ready>
        <Checkout.List />
      </Checkout.Ready>
    </Checkout>
  )
}

export function CheckoutPending() {
  return <p>Loading checkout</p>
}
