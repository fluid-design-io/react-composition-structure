import { Suspense } from "react"
import { BenefitsPrice } from "./benefits.price"

/** Static frame around the price. The section owns the one boundary it needs. */
export function BenefitsPricing() {
  return (
    <section data-testid="pricing-frame">
      <h2>Pricing</h2>
      <Suspense fallback={<BenefitsPrice.Skeleton />}>
        <BenefitsPrice />
      </Suspense>
    </section>
  )
}
