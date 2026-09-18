---
title: "Default placement: a separate module tree"
slug: placement-separate-tree
group: Route-bound module folders
groupNumber: 2
section: "2.4"
impact: HIGH
tags: placement, default, route-files
---

## Default placement: a separate module tree

Use this placement when `placement-detect-router.md` names it, or when a
framework skill sends you here. It works under every router, because it
assumes the worst case, a router that turns every file in its route directory
into a route.

The module lives outside the route directory, in the tree the repo already
uses for route-bound UI (`screens/`, `src/screens/`, `components/`). The
route entry points at it.

```text
<route directory>/
  checkout.tsx            // one-line route entry
screens/
  checkout/
    checkout.tsx
    checkout.screen.tsx
    checkout.states.tsx
    checkout.data.ts
    checkout.list.tsx
    index.ts
```

**The route entry is one line**

```tsx
export { CheckoutScreen as default } from "@/screens/checkout"
```

In a router that registers screens in code, the entry is a one-line screen
registration in a navigator.

Two trees give you three properties:

- moving a route into another group changes one file and never the module
- moving or renaming the module never changes a URL
- several route entries can name one screen, such as a modal and a push
presentation of it

**Bad: module files inside the route directory**

```text
<route directory>/
  checkout/
    index.tsx
    checkout.list.tsx       // the router may serve this as a URL
    checkout.data.ts
```

**Checklist**

- Does the route directory hold only route entries and layouts?
- Is each route entry one line, or does its body hold a route-only concern?
- Does the module import nothing from the route directory?
