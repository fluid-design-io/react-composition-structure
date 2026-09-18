---
title: Colocate internals until a second consumer appears
slug: organization-colocate-internals
group: Organization heuristics
groupNumber: 5
section: "5.3"
impact: MEDIUM
tags: colocation, shared-code, tests, heuristics
---

## Colocate internals until a second consumer appears

Helpers, data, and types live next to the component that uses them. Tests
live in a `__test__/` folder inside the same module.

**Trigger:** a second consumer imports the helper. Until then, keep it where
it is.

**Bad: lifted before a second consumer exists**

```text
lib/
  format-date.ts            // only calendar/detail imports this
  detail-utils.ts           // only calendar/detail imports this
calendar/
  detail/
    detail.header.tsx       // imports ../../lib/format-date
```

`lib/` now claims reuse that does not exist. A change to `detail` edits an
unrelated directory, and a later reader cannot tell shared code from code
lifted too early.

**Good: colocated**

```text
calendar/
  detail/
    detail.header.tsx
    detail.utils.ts         // format-date lives here
    detail.data.ts
    __test__/
      detail.header.test.tsx
    index.ts
```

**Where code goes as consumers appear**

- one consumer: next to it
- two consumers in one module tree: the nearest common parent folder
- consumers in unrelated modules: `lib/` or `shared/`
- data only a subflow reads: the subflow's own `<stem>.data.ts`
- data the root module and a subflow both read: the module-level
`<stem>.data.ts`
- types used inside one folder: that folder's `<stem>.types.ts`
- types that cross a folder boundary: exported through `index.ts`

You can move or delete a module that owns all its internals as one folder.

**Checklist**

- Does a second consumer exist before you lift a helper?
- Do helpers, data, types, and tests sit with their consumer?
- Did lifted code go to the nearest common parent?
- Does `lib/` hold only code that two or more modules import?
