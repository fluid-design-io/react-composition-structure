---
title: The route segment is the module folder
slug: nextjs-segment-is-the-module
group: Next.js App Router
groupNumber: 1
section: "1.1"
impact: HIGH
tags: nextjs, app-router, colocation, placement
---

## The route segment is the module folder

In the App Router only `page.tsx` and `route.ts` make a folder reachable. The
router ignores every other file in the segment. So the module's files sit
beside `page.tsx`, and the route tree is also the module tree.

```text
app/
  (shop)/
    checkout/
      page.tsx               // the blueprint
      checkout.tsx           // namespace and server root
      checkout.context.tsx
      checkout.states.tsx
      checkout.skeleton.tsx
      checkout.metadata.ts
      checkout.server.ts
      checkout.summary.tsx
      checkout.list.tsx
```

The segment name is the module stem. Naming, nesting, and role folders follow
the shared rules. Folders inside a segment take no underscore prefix.

**A segment has no `index.ts`**

`page.tsx` is the module's only consumer and it imports with relative paths.
A barrel would serve nobody.

**Where shared UI goes**

- A child segment shares files with its parent. Put them flat in the nearest
common segment, such as `app/faculty/faculty.avatar.tsx` for
`faculty/page.tsx` and `faculty/[id]/page.tsx`.
- Segments whose only common ancestor is a route group or the locale root
share UI. Put it outside `app/`, in `components/<domain>/`, as a compound
component folder with an `index.ts`.

Name `components/<domain>/` for what the UI is, such as
`components/marketing/`. A folder named after screens would hold no screens
and would mislead the next reader about where screens live.

**What changes a URL**

Renaming or moving a segment folder changes its URL. To regroup routes
without changing URLs, move the segment between route groups, for example
from `(shop)/checkout` to `(account)/checkout`.

**Checklist**

- Do the module's files sit beside `page.tsx`, with the segment name as the
stem?
- Is the segment free of `index.ts`?
- Do shared files sit in the nearest common segment, or in
`components/<domain>/` when no close segment exists?

**Official docs:** `project-structure` (Colocation, Route groups).
