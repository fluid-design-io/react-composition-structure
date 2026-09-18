import { getRouteApi } from "@tanstack/react-router"
import { getCart } from "./checkout.functions"

const route = getRouteApi("/checkout/$id/")

export const loadCheckout = (id: string) => getCart({ data: id })

export const checkoutSearch = (search: Record<string, unknown>) => ({
  coupon: typeof search.coupon === "string" ? search.coupon : undefined,
})

export function useCheckoutData() {
  const { id } = route.useParams()
  const { coupon } = route.useSearch()
  const cart = route.useLoaderData()

  return { id, coupon, cart }
}
