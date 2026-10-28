# React Composition Structure for One

Engineering

October 2026

Version 2.0.0

> Note:
> This guide adds One composition rules to the shared
> `react-composition-structure` skill. Read that skill first, then consult
> the installed official One skills and verify them against current docs
> and the project's installed version.

## Abstract

Route files retain One's framework contracts. Screen modules keep an explicit
blueprint of leaves, gates, layout and native boundaries. One owns runtime
behavior; the personal convention owns composition and placement.

## Table of Contents

1. [One framework](#1-one-framework) (HIGH)
  - 1.1 [Keep route contracts separate from screen modules](#11-keep-route-contracts-separate-from-screen-modules)
  - 1.2 [Show the screen and layout topology explicitly](#12-show-the-screen-and-layout-topology-explicitly)
  - 1.3 [Adapt route data without duplicating its owner](#13-adapt-route-data-without-duplicating-its-owner)
  - 1.4 [Keep native hosts explicit and native internals local](#14-keep-native-hosts-explicit-and-native-internals-local)

## 1. One framework

### 1.1 Keep route contracts separate from screen modules

Find the owning package's route root: `app/`, or `router.root` in its
`one()` options. Keep screen internals outside that directory. The official
One skill gives the same advice. `router.ignoredRouteFiles` can exclude
colocated files, but it only accepts patterns that start with `**/*`. When
an existing package already colocates under a working exclusion, preserve
it unless the task changes placement.

```text
app/
  _layout.tsx
  orders/
    index.tsx
    [id]+ssr.tsx
src/screens/orders/
  orders.tsx
  orders.screen.tsx
  orders.context.tsx
  orders.data.ts
  orders.states.tsx
  orders.display.tsx
  index.ts
src/server/
  orders.server.ts
```

Use the package's established module tree; `src/screens` is an example.
Moving a route group should not move the domain module.

**Bad**

```text
app/orders/
  index.tsx
  orders.context.tsx
  orders.states.tsx
  orders.data.ts
```

This mixes discovery with private files without an exclusion policy.

**Good**

```tsx
export { OrdersScreen as default } from "@/screens/orders"
```

That is the default when no route exports or adapters are needed. A route
may declare a loader, static params, endpoint or other export One requires.
Keep its signature and location compatible with the installed compiler. Do
not hide framework exports in an unverified barrel to force a one-line entry.
The data-boundary rule covers a loader adapter.

Keep routing metadata and render-mode suffixes on the route. Modules never
import their routes. Give a navigable layout a deliberate entry screen and
verify initial navigation; an index file alone does not prove that behavior.
One also expects some route to match `/`, even inside a group.

`+api.ts` routes and `_middleware.ts` are server adapters. They parse the
request, call a server module and shape the response. Business logic lives
in that server module so a loader, an endpoint and a test can share it.
A `+not-found.tsx` follows the same thin-entry rule as a screen route.

Keep platform-specific module files outside the route root and import them
without the platform extension. Retain a route-level platform split when it
changes routing behavior. Leave generated route declarations, native projects
and native-source declarations owned by their generators.

**Checklist**

- Did the owning package and configured root decide placement?
- Are private files outside discovery or explicitly excluded?
- Are framework exports recognized by the installed One version?
- Can the module be imported without importing its route back?
- Do endpoint and middleware files delegate to server modules?
- Was the navigator's entry verified when its structure changed?

**Official docs**

https://onestack.dev/docs/routing
https://onestack.dev/docs/configuration
https://onestack.dev/docs/routing-loader

### 1.2 Show the screen and layout topology explicitly

The screen shows the module's leaves, domain gates and meaningful subtrees.
A root provides context or a frame. It must not silently append the screen's
content, footer or dialogs after its children.

**Bad**

```tsx
export function OrdersScreen() {
  return <Orders />
}
```

The reader cannot see what exists, what disappears or which parts scroll.

**Good**

```tsx
export function OrdersScreen({ initial }: OrdersScreenProps) {
  return (
    <Orders initial={initial}>
      <Orders.Frame>
        <Orders.Header />
        <Orders.Empty />
        <Orders.Ready>
          <Orders.Scroll>
            <Orders.List />
          </Orders.Scroll>
          <Orders.Footer />
        </Orders.Ready>
        <Orders.Confirm />
      </Orders.Frame>
    </Orders>
  )
}
```

`Ready` decides visibility in `orders.states.tsx`; it does not secretly render
List or Footer. The provider derives state precedence once. The screen calls
no router hooks, queries or native services and has no conditional expressions
or state branches.

Show meaningful scroll, fixed-action, presentation and native-host boundaries
in the blueprint. Their leaves own measurement, styles and platform details.
Do not split ordinary markup into a namespace part without a job or consumer.
A simple screen can remain a small declarative file.

A layout blueprint shows providers and One navigation or slot components in
order. A router may inspect direct Screen children; keep those declarations
where its API requires them. Do not hide routing configuration just to give
every element a domain namespace.

```tsx
export default function OrdersLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ title: "Orders" }} />
      <Stack.Screen name="[id]" options={{ title: "Order" }} />
    </Stack>
  )
}
```

App-lifetime providers remain above this route layout. A layout provider
starts only work whose lifetime belongs to that layout.

Show an explicit suspense or error boundary at the composition site that owns
its scope. A leaf must not quietly change its parent's loading topology.
Keep boundaries One owns in its routing contract. Do not add explicit
boundaries to imitate another rendering model, or domain gates for a pending
state already owned by the router.

Native and web components can be different leaves under the same domain
topology. They do not need identical wrappers or layout primitives.

**Checklist**

- Can a reader list the states and visible parts from this tree?
- Are scroll, fixed-action and presentation boundaries visible?
- Do gates own visibility and roots avoid hidden screen content?
- Are routing declarations still in the positions One requires?
- Did a structure-only change preserve boundary behavior?

**Official docs**

https://onestack.dev/docs/routing
https://onestack.dev/docs/routing-loader
https://onestack.dev/docs/native-platforms

### 1.3 Adapt route data without duplicating its owner

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

### 1.4 Keep native hosts explicit and native internals local

Use One APIs directly when a leaf needs no app-specific adaptation. A wrapper
earns its place by owning domain behavior, shared visual policy or a real
platform difference. Do not build a component library around every control.

Keep React Native host bounds separate from native descendant layout. A
Compose root's `style` participates in Yoga while nested nodes use
`composeStyle`. Give scrolling hosts a defined viewport. Check intrinsic
sizing against the installed version instead of assuming every control
measures the same way.

**Bad**

```tsx
<One.Android.Column style={{ flex: 1 }}>
  <One.Android.Button label="Continue" style={{ flex: 1 }} />
</One.Android.Column>
```

The child receives a host layout prop, and neither boundary explains the
intended action size.

**Good**

```tsx
<One.Android.Column
  style={{ width: "100%", height: 80 }}
  composeStyle={{ padding: 12 }}
>
  <One.Android.Button
    label="Continue"
    onPress={continueFlow}
    composeStyle={{ fillMaxWidth: true }}
  />
</One.Android.Column>
```

This demonstrates a boundary, not a universal control height. SwiftUI has its
own styling contract. Read the component's current types and reference
instead of translating Compose props by analogy.

Use only the child shapes a native host supports. A gate or provider inside
a native tree must preserve that shape; a React wrapper does not make an
arbitrary host view a supported native child.

Platform leaves stay inside the module, such as `checkout.actions.android.tsx`
and `checkout.actions.ios.tsx`. Consumers use extensionless imports. Put native
source outside routes and generated projects. Keep feature-specific source
with its feature when the configured scanner supports it. Generated native
declarations stay beside their source as One's tooling requires.

A native view owning a complete interaction can remain one leaf with typed
props and callbacks. Split it only when React consumers compose meaningful
parts. Do not duplicate its state in JavaScript to imitate an old UI.

Host bounds, safe areas, keyboards, system appearance and native colors must
work together. Put measurement and platform hooks in the owning layout leaf
or adapter, keeping the screen declarative. Each inset and keyboard
adjustment has one owner.

Native source changes require regeneration and a native rebuild. Validate
the affected screen and callbacks in that binary. A typecheck or web preview
proves a different boundary.

**Checklist**

- Does the blueprint expose meaningful native hosts and presentations?
- Are host bounds and native child layout at the correct boundary?
- Does each wrapper own a concrete adaptation?
- Are native source and generated outputs in supported locations?
- Were keyboard, appearance and callbacks checked in the target runtime?

**Official docs**

https://onestack.dev/docs/native-platforms
https://onestack.dev/docs/native-source
https://onestack.dev/docs/native-setup
