import { BenefitsHero } from "./benefits.hero"
import { BenefitsRewards } from "./benefits.rewards"

export { metadata } from "./benefits.metadata"

export default function BenefitsPage() {
  return (
    <main>
      <BenefitsHero />
      <BenefitsRewards />
    </main>
  )
}
