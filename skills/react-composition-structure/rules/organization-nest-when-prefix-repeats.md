---
title: Nest folders when filename prefixes repeat
slug: organization-nest-when-prefix-repeats
group: Organization heuristics
groupNumber: 5
section: "5.1"
impact: MEDIUM
groupIntro: "These rules add no new structures. Each one names a trigger that tells you when to nest a flat folder, when to group peers, and when to lift colocated code."
tags: file-organization, nesting, colocation, heuristics
---

## Nest folders when filename prefixes repeat

**Trigger:** three or more sibling files share a leading stem, such as
`calendar.detail.*`. Move them into a folder named for that stem.

Files inside the new folder keep a short stem (`detail/detail.header.tsx`,
not `detail/header.tsx`), so a search for `detail.header` still finds the
file.

**Bad: a flat folder with a repeated prefix**

```text
calendar.detail.header.tsx
calendar.detail.list.tsx
calendar.detail.footer.tsx
calendar.detail.utils.ts
calendar.detail.data.ts
calendar.detail.types.ts
calendar.list.tsx
calendar.data.ts
calendar.types.ts
```

Problems:

- `detail` repeats in six names and separates nothing
- `calendar.detail.*` and `calendar.*` interleave when sorted
- every file looks importable, because no file marks a boundary
- nobody can move or delete the detail flow as a unit

**Good: the folder carries the prefix**

```text
calendar/
  detail/
    detail.header.tsx
    detail.list.tsx
    detail.footer.tsx
    detail.utils.ts
    detail.data.ts
    detail.types.ts
    index.ts
  calendar.list.tsx
  calendar.data.ts
  calendar.types.ts
  index.ts
```

**When the subfolder gets an `index.ts`**

A subfolder gets its own `index.ts` only when it is a subflow that its parent
consumes as a unit, as `detail/` is here. Otherwise files import each other
directly (`./detail.header`) and the module's root `index.ts` stays the only
public boundary (see `boundaries-public-api.md`).

**When not to nest**

- the folder would hold one or two files
- the prefix appears twice and shows no sign of growing
- the only gain is symmetry

Count the folder your change produces, not the folder you start with. Two
files that the same change grows into a provider, gates, and a screen already
meet the trigger. Tests move with their files into the folder's `__test__/`
and do not count. Inside a module that is already past the role-folder
trigger, two files that own a distinct flow may still nest. Write that reason
in the commit.

When no prefix repeats but the flat listing is long, group by role instead
(see `organization-group-by-role.md`).

**Checklist**

- Do three or more sibling files share a leading stem?
- Does the new folder keep the short stem on its files?
- Does the folder have an `index.ts` only if its parent consumes it as a
unit?
