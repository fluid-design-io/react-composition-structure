---
title: Export one module root by default
slug: boundaries-public-api
group: Public API boundaries
groupNumber: 3
section: "3.1"
impact: MEDIUM
tags: public-api, exports, boundaries
---

## Export one module root by default

A module folder exports its root namespace and nothing else, unless another
export is a deliberate entry point. Callers then import one name, and the
files inside the folder can change without breaking them.

**Bad: export everything inside the folder**

```ts
export { CheckoutScreen } from "./checkout.screen"
export { CheckoutList } from "./checkout.list"
export { useCheckoutData } from "./checkout.data"
export { CheckoutSummary } from "./checkout.summary"
```

Callers now depend on the folder's layout, and every internal rename breaks
an import.

**Good: export the entry points**

```ts
export { Checkout } from "./checkout"
```

A module with two or more screens exports each screen beside the root (see
`architecture-route-bound-module-folders.md`):

```ts
export { Faculty } from "./faculty"
export { FacultyDirectoryScreen } from "./faculty.directory.screen"
export { FacultyDetailScreen } from "./faculty.detail.screen"
```

**A consumer proves each export**

When you restructure an existing barrel, search for each exported symbol
outside the module. Delete the exports nobody imports. Do not carry them into
the new `index.ts`.

**Exceptions**

Export another symbol only when it is part of the contract:

- a documented type for external consumers
- a route helper that code outside the module calls
- a test utility in a separate testing entry point

Write the reason next to the export.

**Checklist**

- Does `index.ts` export only entry points?
- Do callers import the namespace and not internal leaves?
- Did a consumer search prove every export you kept?
- Does each exception have a written reason?
