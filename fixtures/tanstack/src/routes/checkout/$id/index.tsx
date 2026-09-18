import { createFileRoute } from "@tanstack/react-router"
import { CheckoutPending, CheckoutScreen, checkoutSearch, loadCheckout } from "./-checkout"

export const Route = createFileRoute("/checkout/$id/")({
  validateSearch: checkoutSearch,
  loader: ({ params }) => loadCheckout(params.id),
  pendingComponent: CheckoutPending,
  component: CheckoutScreen,
})
