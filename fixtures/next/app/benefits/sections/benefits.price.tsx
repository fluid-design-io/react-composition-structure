import { cookies } from "next/headers"

async function BenefitsPriceRoot() {
  const region = (await cookies()).get("region")?.value ?? "US"

  return <p>Price for {region}</p>
}

function BenefitsPriceSkeleton() {
  return <p data-testid="price-skeleton">Loading price</p>
}

export const BenefitsPrice = Object.assign(BenefitsPriceRoot, { Skeleton: BenefitsPriceSkeleton })
