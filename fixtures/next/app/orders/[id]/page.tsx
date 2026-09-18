import { Suspense } from "react"
import { Orders } from "./orders"

export { generateMetadata, generateStaticParams } from "./orders.metadata"

/** One order. The summary streams in, the heading is in the static shell. */
export default function OrdersPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <main>
      <h1>Your order</h1>
      <Suspense fallback={<Orders.Skeleton />}>
        <Orders params={params}>
          <Orders.Summary />
          <Orders.Expanded>
            <Orders.Items />
          </Orders.Expanded>
        </Orders>
      </Suspense>
    </main>
  )
}
