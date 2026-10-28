---
title: Show the screen and layout topology explicitly
slug: one-blueprint-topology
group: One framework
groupNumber: 1
section: "1.2"
impact: HIGH
tags: one, blueprint, gates, layouts, boundaries
---

## Show the screen and layout topology explicitly

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
