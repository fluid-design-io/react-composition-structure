import { CheckoutProvider } from "./checkout.context"
import { CheckoutList } from "./checkout.list"
import { CheckoutOffline, CheckoutReady } from "./checkout.states"

export const Checkout = Object.assign(CheckoutProvider, {
  Offline: CheckoutOffline,
  Ready: CheckoutReady,
  List: CheckoutList,
})
