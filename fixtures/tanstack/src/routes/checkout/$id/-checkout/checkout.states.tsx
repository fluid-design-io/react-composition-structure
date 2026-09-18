import type { PropsWithChildren } from "react"
import { useCheckoutContext } from "./checkout.context"

/** Full-page substitute when the device is offline. */
export function CheckoutOffline() {
  const { state } = useCheckoutContext()
  if (state.status !== "offline") return null

  return <p>You are offline.</p>
}

export function CheckoutReady({ children }: PropsWithChildren) {
  const { state } = useCheckoutContext()
  if (state.status !== "ready") return null

  return <>{children}</>
}
