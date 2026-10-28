---
title: Adapt route data without duplicating its owner
slug: one-data-boundaries
group: One framework
groupNumber: 1
section: "1.3"
impact: HIGH
tags: one, loaders, providers, server-code, state
---

## Adapt route data without duplicating its owner

Choose data ownership from the requirements and One's runtime contract.
A module can consume a loader, client query or domain service. This skill
does not require migrating every read to loaders.

Module hooks, derivation and orchestration live in `<stem>.data.ts`. The
context wires them to a `state`, `actions`, `meta` contract. Include only
fields the module needs. Leaves consume that contract; they do not import
the route, recreate its loader or start a second controller.

**Bad**

```tsx
// orders.data.ts
import { loader } from "@/app/orders/[id]+ssr"

export function useOrdersData() {
  return useLoader(loader)
}
```

The route imports the screen, so this creates a reverse dependency.

**Good**

```tsx
// route entry
import { useLoader, type LoaderProps } from "one"
import { OrdersScreen } from "@/screens/orders"

export async function loader({ params }: LoaderProps<{ id: string }>) {
  const { readOrder } = await import("@/server/orders.server")
  return readOrder(params.id)
}

export default function OrdersRoute() {
  const initial = useLoader(loader)
  return <OrdersScreen key={initial.id} initial={initial} />
}
```

This tiny framework adapter binds the hook to its own export. The screen
passes the plain payload to its provider. A client-only screen whose provider
owns its data needs no adapter. A loader-backed provider must not
automatically issue a duplicate initial read. If the package types loaders
with `createRoute<"/orders/[id]">().createLoader`, keep that form; the
adapter shape is the same.

One refetches the loader when the path, params or search change, so the
same mounted screen can receive a new payload. A state initializer does not
synchronize later props. Keying the screen by route identity resets local
drafts when the record changes. When a draft must survive revalidation of
the same record, reconcile it in `<stem>.data.ts` instead. Either way the
policy is visible in one place.

Manual refresh belongs to the module, not to a leaf. `<stem>.data.ts` can
call `useLoaderState()` with no argument, which returns `refetch` and
`state` for the current route without importing it. Expose them as an
action and a state field. A pull-to-refresh leaf or a mutation then calls
that action.

```ts
// orders.data.ts
import { useLoaderState } from "one"

export function useOrdersData(initial: OrderSnapshot) {
  const { refetch, state } = useLoaderState()
  return {
    state: { ...derived, refreshing: state === "loading" },
    actions: { refresh: refetch },
  }
}
```

A layout loader feeds the layout's own adapter, which provides it to the
subtree. Leaves do not read `useMatches()` to reach a parent's payload.

Retain recognizable route-local exports until extraction or re-export is
verified against the installed compiler. Server helpers stay outside the UI
module's public barrel. A file outside the route root is not inherently
server-only.

Verify One strips private loader imports from browser and native bundles.
Returned payloads must contain only client-safe values. Loader execution and
caching depend on render mode and runtime. Do not impose an async
server-component root or client directive from a different rendering model.

Put native adapters with their feature, or a shared device owner when several
consumers exist. State that outlives a route needs a longer-lived owner.
Moving code into a provider must not shorten the life of a running transport,
operation or durable record.

**Checklist**

- Does each read, subscription and controller have one owner?
- Does the UI module avoid importing its route?
- Is refresh an action of the module rather than a hook in a leaf?
- Is the reset policy for a new route payload explicit?
- Are server helpers excluded from client barrels and bundles?
- Is the loader payload client-safe?
- Are long-lived services independent of screen mount lifetime?

**Official docs**

https://onestack.dev/docs/routing-loader
https://onestack.dev/docs/configuration
https://onestack.dev/docs/native-source
