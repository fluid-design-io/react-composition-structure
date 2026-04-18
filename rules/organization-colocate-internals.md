---
title: Colocate Internals Until a Second Consumer Appears
impact: MEDIUM
impactDescription: prevents premature abstraction and keeps features self-contained
tags: file-organization, colocation, refactoring
---

## Colocate Internals Until a Second Consumer Appears

Keep a feature's helpers, data fetching, types, and tests next to the
component that uses them. Only lift code into a shared `lib/`, `shared/`, or
`utils/` location when a **second** consumer actually appears.

Premature sharing creates two problems:

1. The shared module becomes a dumping ground with unclear ownership
2. Changes to one consumer's needs ripple into unrelated features

**Incorrect (extracted before a second consumer exists):**

```
src/
  lib/
    format-date.ts          // used only by feature.detail
    detail-utils.ts         // used only by feature.detail
  features/
    feature/
      detail/
        detail.header.tsx   // imports from ../../../lib/format-date
```

Problems:

- `lib/` suggests reuse that doesn't exist
- Refactoring `detail` now requires touching an unrelated directory
- Future engineers can't tell what's actually shared vs. accidentally hoisted

**Correct (colocate until reuse is proven):**

```
src/
  features/
    feature/
      detail/
        detail.header.tsx
        detail.utils.ts     // format-date lives here
        detail.data.ts
        detail.test.tsx
        index.ts
```

If a second feature later needs `formatDate`, *then* promote it:

```
src/
  lib/
    format-date.ts          // now genuinely shared
  features/
    feature/detail/...
    other-feature/...
```

**Rules of thumb:**

- One consumer → colocate
- Two consumers in the same feature tree → lift to the nearest common parent
- Two+ consumers across feature trees → lift to `lib/` or `shared/`
- Tests live next to the file they test (`detail.header.test.tsx`)
- Types used only inside a folder stay in `*.types.ts` within that folder;
  types crossing a folder boundary get exported via `index.ts`

**Why this pairs with compound components:**

Compound components treat a folder as a namespace with a public API. Colocation
is the same principle applied to non-component code: the folder owns its
internals, and the `index.ts` decides what leaks out. Together they make
features **movable** — you can relocate or delete a whole folder without
hunting for strays in `lib/`.
