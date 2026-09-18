---
title: The blueprint shows what streams
slug: nextjs-blueprint-shows-topology
group: Next.js App Router
groupNumber: 1
section: "1.3"
impact: HIGH
tags: nextjs, suspense, skeletons, static-shell, streaming
---

## The blueprint shows what streams

A Next.js route has a static shell and parts that stream into it. Write every
`<Suspense>` boundary in `page.tsx`, so a reader sees which parts stream
without opening a leaf.

**Bad: the leaf hides its own boundary**

```tsx
// orders.history.tsx
export function OrdersHistory({ params }: Props) {
  return (
    <Suspense fallback={<Spinner />}>
      <OrdersHistoryList params={params} />
    </Suspense>
  )
}
```

```tsx
// page.tsx
<Orders.History params={params} />
```

The page reads as if the history were static.

**Good: the boundary is in the blueprint**

```tsx
<main>
  <h1>Your orders</h1>
  <Suspense fallback={<Orders.Skeleton />}>
    <Orders params={params}>
      <Orders.Summary />
    </Orders>
  </Suspense>
  <Suspense fallback={<OrdersHistory.Skeleton />}>
    <OrdersHistory params={params} />
  </Suspense>
</main>
```

**Rules for boundaries**

- A leaf never wraps itself in `<Suspense>`.
- Each boundary wraps one async component. Two reads get two boundaries.
- Anything that renders the same in the fallback and the result goes above
the boundary. The page heading always does.
- The fallback is the module's own skeleton, attached to the namespace as
`.Skeleton` and defined in `<stem>.skeleton.tsx`. Do not write a second
skeleton that mirrors the page layout.
- `loading.tsx` is the router's boundary for the whole segment. When a
segment has one, do not add a module skeleton for the same state.

Where a boundary goes, what to cache, and what to prefetch are rendering
decisions. The official Next.js docs and skills decide them. This rule only
says that the result is written in `page.tsx`.

**Checklist**

- Is every `<Suspense>` in the route written in `page.tsx`?
- Is each fallback the wrapped module's `.Skeleton`?
- Do the heading and other static parts sit above the boundaries?

**Official docs:** `instant-navigation`, `migrating-to-cache-components`,
`loading`.
