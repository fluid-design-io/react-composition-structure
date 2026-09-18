---
title: Use module folders for route-bound UI
slug: architecture-route-bound-module-folders
group: Route-bound module folders
groupNumber: 2
section: "2.1"
impact: HIGH
tags: file-organization, module-folders, route-bound, data-orchestration
---

## Use module folders for route-bound UI

Give a page or screen a module folder when it has any of these:

- route UI plus several internal leaves
- its own query or mutation orchestration
- several related screens
- nested subflows

A small page stays one flat file. *Feature* in this guide means the domain
module being restructured (checkout, calendar, cart). It does not mean a
`features/` directory.

This rule covers the module's shape. Where the folder sits relative to the
route file depends on the router. Run `placement-detect-router.md` before you
create or move a module. The trees below have no parent directory on purpose.

**Bad: domain logic spread across global folders**

```text
checkout.tsx
useCheckout.ts
CheckoutList.tsx
CheckoutSummary.tsx
types.ts
helpers.ts
```

Problems:

- the module has no single home
- data logic drifts into generic hook folders
- the route file collects orchestration

**Good: one module folder**

```text
checkout/
  checkout.tsx             // namespace, when the module exposes 2+ leaves
  checkout.screen.tsx      // route-facing UI, a blueprint
  checkout.data.ts         // module-owned orchestration
  checkout.list.tsx        // leaf
  checkout.summary.tsx     // leaf
  checkout.types.ts
  index.ts                 // public boundary
```

A module that exposes screens and at most one leaf can skip `checkout.tsx`
and export from `index.ts` directly.

**Bad: the route file owns domain orchestration**

```tsx
export default function CheckoutRoute() {
  const { cart, isSubmitting, submitOrder } = useCheckout()

  return (
    <CheckoutLayout>
      <CheckoutList cart={cart} />
      <CheckoutSubmitButton loading={isSubmitting} onPress={submitOrder} />
    </CheckoutLayout>
  )
}
```

**Good: the route file is a thin entry**

The route file points at the module. Its body holds route-only concerns:
options the router reads from that file, route-group chrome, a platform
quirk. Knowledge about the URL itself goes in a doc comment in the route
file, for example why a catch-all segment exists. The placement rule for the
router says what else the route file may hold.

**Params belong to the module**

The module parses its own route params in its context or data file. When
parsing is more than a cast (amounts, composite ids), put the helpers in
`<stem>.params.ts`. A router that hands params to the route file passes them
to the module unparsed.

**Multi-screen modules**

When a module has two or more screens, export each screen as a top-level
symbol. The namespace holds shared leaves only, such as `Faculty.Avatar`.

```text
faculty/
  faculty.tsx                  // Faculty = { Avatar }
  faculty.directory.screen.tsx
  faculty.detail.screen.tsx
  faculty.avatar.tsx
  faculty.data.ts
  index.ts
```

```ts
export { Faculty } from "./faculty"
export { FacultyDirectoryScreen } from "./faculty.directory.screen"
export { FacultyDetailScreen } from "./faculty.detail.screen"
```

**What belongs in `<stem>.data.ts`**

- grouped view models
- queries and mutations only this module runs
- filter and search state
- adapters only this module uses

Generic API clients and hooks with several consumers live elsewhere. When a
subflow nests, data that only the subflow reads moves into the subflow's own
data file (see `organization-colocate-internals.md`).

**Nested subflows**

```text
profile/
  profile.tsx
  profile.screen.tsx
  profile.data.ts
  security/
    security.tsx
    security.screen.tsx
    security.data.ts
    index.ts
  index.ts
```

Nest a folder when it owns a flow. Do not nest for symmetry.

**Checklist**

- Is a flat route file still enough?
- Did `placement-detect-router.md` decide where the module sits?
- Does the route file hold only route concerns?
- Does the module parse its own params?
- Does module-owned orchestration live in `<stem>.data.ts`?
- Does each nested folder own a flow?
