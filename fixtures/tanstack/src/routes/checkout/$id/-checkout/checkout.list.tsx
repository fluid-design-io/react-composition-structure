import { useCheckoutContext } from "./checkout.context"

export function CheckoutList() {
  const { state } = useCheckoutContext()

  return (
    <ul>
      {state.cart.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
