import type { PropsWithChildren } from "react"

/** Static frame around the price. The page passes the streamed part in. */
export function BenefitsPricing({ children }: PropsWithChildren) {
  return (
    <section data-testid="pricing-frame">
      <h2>Pricing</h2>
      {children}
    </section>
  )
}
