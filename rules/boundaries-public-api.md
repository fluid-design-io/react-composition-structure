## Export One Module Root by Default

For shared component folders and feature folders, export one root symbol by
default. Keep internal leaves internal unless they are intentionally public.

**Bad (barrel leaks the whole implementation):**

```ts
export { CheckoutScreen } from "./checkout.screen"
export { CheckoutList } from "./checkout.list"
export { useCheckoutData } from "./checkout.data"
```

**Good (barrel exports the root):**

```ts
export { Checkout } from "./checkout"
```

```ts
export { Composer } from "./composer"
```

This keeps callers stable while the inside of the folder evolves.

Reasonable exceptions:

- documented public types
- explicitly reusable helpers
- test-only entrypoints kept in a separate testing boundary

If an exception exists, document it. Do not let barrels grow accidentally.
