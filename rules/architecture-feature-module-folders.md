## Use Feature Folders for Route-Bound UI

Use a feature folder when a page or screen owns enough local complexity that
colocation improves clarity.

**Bad (feature scattered across unrelated files):**

```text
checkout.tsx
useCheckout.ts
CheckoutList.tsx
CheckoutSummary.tsx
types.ts
helpers.ts
```

**Good (one feature folder with thin route wiring):**

```text
checkout/
  checkout.tsx
  checkout.screen.tsx
  checkout.data.ts
  checkout.list.tsx
  checkout.summary.tsx
  checkout.types.ts
  index.ts
```

Put responsibilities in these files:

- `<feature>.tsx`: assemble the public namespace
- `<feature>.screen.tsx` or `<feature>.page.tsx`: own route-facing UI
- `<feature>.data.ts`: own feature-local orchestration
- leaf files such as `.list.tsx`, `.summary.tsx`, `.form.tsx`: own internal sections
- `index.ts`: export the feature root only

**Bad (route owns feature orchestration):**

```tsx
export default function CheckoutRoute() {
  const { cart, submitOrder } = useCheckout()
  return <CheckoutList cart={cart} onSubmit={submitOrder} />
}
```

**Good (route stays thin):**

```tsx
import { Checkout } from "@/features/checkout"

export default function CheckoutRoute() {
  return <Checkout.Screen />
}
```

Keep `*.data.ts` for feature-owned queries, mutations, search state, and view
model shaping. Do not use it for generic infra or widely shared hooks.

Use nested subfolders only when a feature contains real subflows with their own
screens, data modules, or reusable entry surfaces.
