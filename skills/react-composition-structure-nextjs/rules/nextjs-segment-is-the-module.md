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

Naming, nesting, and role folders follow the shared rules. That includes
the shared rule's ban on a role folder named `components/`, which would
produce `components/components.benefit-row.tsx`. Name the folder for what
its files are, such as `rows/`, or keep the files flat. Folders inside a
segment take no underscore prefix. Images, fonts, stylesheets, and metadata
image files stay in the segment under their own names.

A page that is a list of sections keeps them in `sections/`, and those
files keep the route stem (see `nextjs-sections-folder.md`).

**Choosing the stem**

The stem is the name of the nearest static segment. Three cases need more:

- A dynamic segment such as `[id]`, or a route group such as `(shop)`, has
no name of its own. Use the nearest static segment above it.
- A list route and its detail route would then share a stem. Give the detail
route the singular, so `posts/page.tsx` uses `posts` and
`posts/[slug]/page.tsx` uses `post`.
- A segment name that says little alone, or that repeats elsewhere in the
repo, such as `settings` or `app`, takes its parent as a prefix, as in
`account-settings`.

The root page has no segment name. Propose `home` or the name the team
already uses. When two stems both look reasonable, propose one and ask the
user. A stem is cheap to pick and costly to rename later.

**The segment root has no `index.ts`**

`page.tsx` is the module's only consumer and it imports with relative paths,
so a barrel at the segment root would serve nobody. A subflow folder inside
the segment follows the shared rule and may have an `index.ts` that its
parent consumes as a unit.

**Where shared UI goes**

- A child segment shares files with its parent. Put them flat in the nearest
common segment, such as `app/faculty/faculty.avatar.tsx` for
`faculty/page.tsx` and `faculty/[id]/page.tsx`.
- Segments whose only common ancestor is a route group or the locale root
share UI. Put it outside `app/`, in `components/<domain>/`, as a compound
component folder with an `index.ts`.

That form fits UI with one root and its parts. Sections that share a domain
and nothing else, such as the marketing sections of several landing pages,
are peers of one kind. Put them flat in `components/<domain>/` with no
`index.ts`, and import each file by its path. A barrel there would load
every section for a page that renders one.

Name `components/<domain>/` for what the UI is, such as
`components/marketing/`. A folder named after screens would hold no screens
and would mislead the next reader about where screens live.

**What changes a URL**

Renaming or moving a segment folder changes its URL. To regroup routes
without changing URLs, move the segment between route groups, for example
from `(shop)/checkout` to `(account)/checkout`.

**Checklist**

- Do the module's files sit beside `page.tsx` and share one stem?
- Did you ask the user when the stem was not obvious?
- Is the segment root free of `index.ts`?
- Do shared files sit in the nearest common segment, or in
`components/<domain>/` when no close segment exists?
- Does `components/<domain>/` have an `index.ts` only when it holds one
compound component?

**Official docs:** `project-structure` (Colocation, Route groups).
