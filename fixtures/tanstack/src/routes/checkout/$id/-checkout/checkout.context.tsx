import { createContext, use, useState, type PropsWithChildren } from "react"
import { useCheckoutData } from "./checkout.data"

type CheckoutContextValue = {
  state: ReturnType<typeof useCheckoutData> & { status: "offline" | "ready" }
  actions: { setOffline: (offline: boolean) => void }
  meta: Record<string, never>
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export function useCheckoutContext() {
  const value = use(CheckoutContext)
  if (!value) throw new Error("useCheckoutContext must be used inside <Checkout>")
  return value
}

export function CheckoutProvider({ children }: PropsWithChildren) {
  const data = useCheckoutData()
  const [offline, setOffline] = useState(false)
  const value: CheckoutContextValue = {
    state: { ...data, status: offline ? "offline" : "ready" },
    actions: { setOffline },
    meta: {},
  }

  return <CheckoutContext value={value}>{children}</CheckoutContext>
}
