import { BenefitsHero } from "./sections/benefits.hero"
import { BenefitsPricing } from "./sections/benefits.pricing"
import { BenefitsRewards } from "./sections/benefits.rewards"

export { metadata } from "./benefits.metadata"

export default function BenefitsPage() {
  return (
    <main>
      <BenefitsHero />
      <BenefitsRewards />
      <BenefitsPricing />
    </main>
  )
}
