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

Use a module folder when a page or screen owns real local complexity. *Feature*
here means the domain module you are restructuring, not a required `features/`
parent directory. Place the folder wherever the repo already groups route-bound
UI (`screens/`, `components/`, etc.).

Signs the module has grown enough:

- route UI plus several internal leaves
- domain-specific query or mutation orchestration
- multiple related screens
- nested subflows within one module

Do not force small pages or screens into folders.

**Bad: domain logic scattered across unrelated globals**

```text
checkout.tsx
useCheckout.ts
CheckoutList.tsx
CheckoutSummary.tsx
types.ts
helpers.ts
```

Problems:

- the module has no obvious home
- data logic drifts into generic hook folders
- route wrappers tend to accumulate orchestration

**Good: one colocated module folder with thin route wiring**

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

File ownership:

- `<feature>.tsx` assembles the public namespace when the module exposes a
compound namespace (2+ leaves, or 1 leaf plus shared state). A module that
only exposes screens and a single leaf can skip `<feature>.tsx` and export
directly from `index.ts`.
- `checkout.screen.tsx` owns the main route-facing UI, kept as a
declarative blueprint once render states multiply (see
`architecture-screen-blueprints.md`)
- `checkout.data.ts` owns module-local orchestration
- leaf files such as `checkout.list.tsx` and `checkout.summary.tsx` own
presentational sections
- `index.ts` owns the public boundary (module root by default; top-level
screen exports when a module has two or more screens, see
**Multi-screen modules**)

**Bad: route file owns domain orchestration**

```tsx
export default function CheckoutRoute() {
  const { cart, isSubmitting, submitOrder } = useCheckout()

  return (
    <CheckoutLayout>
      <CheckoutList cart={cart} />
      <CheckoutSubmitButton
        loading={isSubmitting}
        onPress={submitOrder}
      />
    </CheckoutLayout>
  )
}
```

**Good: the route file is a one-line re-export**

```tsx
export { CheckoutScreen as default } from "@/screens/checkout"
```

In a file-based router (Expo Router, Next.js), the route file is a manifest
entry: a pointer into the module, not a home for code. The screen stays in
the module so the module stays movable, and so several route files can name
the same screen (a catch-all plus its bare segment, a modal and a push
presentation). A registration-based router (React Navigation stacks) makes
the same shape a one-line screen registration in a navigator.

**Params belong to the module**

The module reads and parses its own route params inside its context or data
file; that is what keeps the route file at one line. When parsing is
nontrivial (amounts, composite ids), colocate the parse helpers in a
`*.params.ts`.

A route file earns a body only for route-only concerns: static options the
router reads at build time, route-group chrome, a platform quirk. Route-only
knowledge (why this URL exists at all, such as a catch-all segment that
cannot match the bare path) lives as a doc comment in the route file. It is
routing knowledge, not screen knowledge, and it has nowhere else to go.

**Multi-screen modules**

When a domain module has two or more screens, export each screen as a
top-level symbol from `index.ts` instead of namespacing them under the module
root. Keep the module namespace reserved for shared compound leaves such as
`Faculty.Avatar`. A module with exactly one screen may still use
`Feature.Screen` for symmetry.

```text
faculty/
  faculty.tsx                // Faculty = { Avatar }
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

The set of exports should map to the set of intentional public entry points.
One root is the default, not a hard cap.

**What belongs in `*.data.ts`**

Put module-owned orchestration there:

- grouped view models
- screen-local queries and mutations
- filtering and search state
- adapters only this module uses

Do not put generic API clients or widely shared hooks there.

When a subflow nests (see `organization-nest-when-prefix-repeats.md`),
subflow-only data moves into the subflow's `*.data.ts`; see
`organization-colocate-internals.md`.

**Nested subflows**

When one domain module contains distinct subflows, use nested folders only if
they represent real ownership.

```text
profile/
  profile.tsx
  profile.screen.tsx
  profile.data.ts
  security/
    profile-security.tsx
    profile-security.screen.tsx
    profile-security.data.ts
    index.ts
  preferences/
    profile-preferences.tsx
    profile-preferences.form.tsx
    index.ts
  index.ts
```

Create nested folders for real subflows, not symmetry.

**Checklist**

- Is a flat route file still enough?
- Does the module have one obvious home?
- Is the route file a one-line re-export, or does its body own a route-only
concern?
- Does the module read and parse its own params?
- Is module-owned orchestration colocated in `*.data.ts`?
- Do nested folders represent real subflows?
