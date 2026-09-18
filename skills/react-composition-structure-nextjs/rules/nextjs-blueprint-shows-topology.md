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

**A boundary deep inside a static section**

When the streamed part sits inside static markup, the section takes
`children` and the page passes the boundary in:

```tsx
<BenefitsPricing>
  <Suspense fallback={<Price.Skeleton />}>
    <Price />
  </Suspense>
</BenefitsPricing>
```

The section stays static, and the page still shows what streams.

**Rules for boundaries**

- A leaf never wraps itself in `<Suspense>` or in an error boundary. Both
are written in the page.
- Each boundary wraps one async component. Two reads get two boundaries.
- Anything that renders the same in the fallback and the result goes above
the boundary. The page heading always does.
- The fallback is the module's own skeleton, attached to the namespace as
`.Skeleton` and defined in `<stem>.skeleton.tsx`. Do not write a second
skeleton that mirrors the page layout.
- `loading.tsx` is the router's boundary for the whole segment. When a
segment has one, do not add a module skeleton for the same state.

**When the task must not change what streams**

A new `<Suspense>` changes what the route sends first. A task that only
moves files may not do that. When the old page awaits outside any boundary,
make the page sync, move the await into the async root, and add no boundary
around the root. A boundary that the old page had further down stays where
it is in the tree. The page then shows one root with no fallback, which is
how the route already behaved.

Tell the user which routes ended this way, because each one still blocks on
its root. Do the same with anything else the task did not ask you to fix,
such as an import that climbs two levels. Report it and leave it.

**A skeleton that is one element still gets its file**

When the fallback is a single generic element, such as
`<Skeleton className="h-96" />`, still write `<stem>.skeleton.tsx` and attach
it as `.Skeleton`. Every fallback in every page then reads
`<Orders.Skeleton />`, and a reader never has to ask whether an inline
fallback belongs to the module.

Where a boundary goes, what to cache, and what to prefetch are rendering
decisions. The official Next.js docs and skills decide them. This rule only
says that the result is written in `page.tsx`.

**Checklist**

- Is every `<Suspense>` in the route written in `page.tsx`?
- Is each fallback the wrapped module's `.Skeleton`, even when it is one
element?
- If the task may not change what streams, did you add no boundary and tell
the user which roots still block?
- Do the heading and other static parts sit above the boundaries?

**Official docs:** `instant-navigation`, `migrating-to-cache-components`,
`loading`.
