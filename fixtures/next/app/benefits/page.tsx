import { Suspense } from "react"
import { BenefitsHero } from "./benefits.hero"
import { BenefitsPricing } from "./benefits.pricing"
import { BenefitsPrice } from "./benefits.price"
import { BenefitsRewards } from "./benefits.rewards"

export { metadata } from "./benefits.metadata"

export default function BenefitsPage() {
  return (
    <main>
      <BenefitsHero />
      <BenefitsRewards />
      <BenefitsPricing>
        <Suspense fallback={<BenefitsPrice.Skeleton />}>
          <BenefitsPrice />
        </Suspense>
      </BenefitsPricing>
    </main>
  )
}
