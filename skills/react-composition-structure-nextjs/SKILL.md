---
name: react-composition-structure-nextjs
description: File structure and page composition for the Next.js App Router. Use when adding or restructuring a route segment, deciding what `page.tsx` contains, placing `<Suspense>` boundaries and skeletons in a page, splitting a compound component across the server and client boundary, moving `generateMetadata` out of a page, or choosing between a state gate and a server-decided variant.
metadata:
  author: oliverpan
  version: 2.0.0
---

# React composition structure for Next.js

## Stop if the shared skill is missing

Check that `../react-composition-structure/SKILL.md` exists before anything
else. If it does not exist, do not create or edit any file, and do not
continue with the rules below. Reply with the reason and this command, then
wait for the user:

```bash
npx skills add fluid-design-io/react-composition-structure --skill react-composition-structure
```

The rules below use the shared skill's vocabulary (root, leaf, gate,
blueprint, stem) and its naming and folder rules. Work done without them
needs redoing.

## Check that this skill applies

It applies when the nearest `package.json` lists `next` and the package has `app/**/page.tsx` or `src/app/**/page.tsx`. If the evidence does not match, go back to the router table in the
shared skill.

Then read `../react-composition-structure/SKILL.md`, if you have not read it
in this session.

## What this skill covers

These rules say where a route's files live and how `page.tsx` reads. They do
not say what to cache, where a boundary performs best, or what to prefetch.
The official Next.js docs and the official `next-*` skills decide those, and
they win any conflict. Tell the user what conflicted.

Each rule ends with **Official docs** and a list of slugs. A slug names a
file in the docs that ship with the installed Next.js version, under
`node_modules/next/dist/docs/`. The name in parentheses is a heading in that
file. When the package has no bundled docs, use the same slug at
https://nextjs.org/docs.

Doc comments in this skill record product intent on the subtree they
explain. Do not add comments that explain rendering mechanics, and do not
remove intent comments when an official skill tells you not to narrate a
refactor.

## The shape of every route

Every route with request data has this shape. The rules explain each line.

```text
app/orders/[id]/
  page.tsx               // the blueprint, and nothing else
  orders.tsx             // namespace and async server root, no "use client"
  orders.context.tsx     // "use client" provider
  orders.display.tsx     // "use client" leaves
  orders.states.tsx      // "use client" gates, when the route has them
  orders.skeleton.tsx
  orders.metadata.ts
  orders.server.ts
```

```tsx
// page.tsx
import { Suspense } from "react"
import { Orders } from "./orders"

export { generateMetadata } from "./orders.metadata"

export default function OrdersPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <main>
      <h1>Your order</h1>
      <Suspense fallback={<Orders.Skeleton />}>
        <Orders params={params}>
          <Orders.Summary />
          <Orders.Expanded>
            <Orders.Items />
          </Orders.Expanded>
        </Orders>
      </Suspense>
    </main>
  )
}
```

- The page is sync. It passes `params` down as a promise and never awaits.
The one page that stays async is a page with an access check, which you
leave alone and report.
- The page holds the whole tree. No `<stem>.screen.tsx` exists unless two
routes share the screen.
- Every `<Suspense>` is in the page, with the module's `.Skeleton` as the
fallback. The one other place is a section file in `sections/`.
- `orders.tsx` has no `"use client"`. Its async root awaits `params`, reads
data, and passes plain data to the client provider.
- A route that reads request data and has no client state drops the
provider and keeps everything else. The page still wraps the async root in
`<Suspense>` with its `.Skeleton`, and the root renders server leaves with
props.
- Only a page that reads no request data at all drops `<Suspense>`. It is a
list of server components from `sections/`, with no wrapper markup in the
page. A section that streams owns its boundary.
- The page root is the `<main>` landmark, written in `page.tsx` and nowhere
else.
- A task that only moves files adds no `<Suspense>`. A root that had no
boundary before gets none now, and you tell the user which roots still
block.

These rules cover `page.tsx`, `layout.tsx`, and the files beside them. They
do not cover parallel route slots, intercepting routes, route handlers,
`template.tsx`, or `default.tsx`. When a task needs one of those, or when a
route does not fit the shapes above, follow the shared skill. Describe the
case, offer options, and ask the user where the files should go. Do not bend
the route to match the example, and do not import from another segment to
make it work.

## Rules

Read rules 1.1 to 1.4 before you add or restructure a route. Read rule 1.5
when the route has more than one state, rule 1.6 before you touch a
`layout.tsx`, and rule 1.7 when the page lists sections.

| Rule | Covers |
| --- | --- |
| 1.1 `nextjs-segment-is-the-module` | Module files sit in the route segment, with no `index.ts`. Where shared UI goes |
| 1.2 `nextjs-page-is-the-blueprint` | A sync `page.tsx` that holds the tree, passes `params` down as a promise, and re-exports routing exports from `<stem>.metadata.ts`. Pages that await translations, guard access, or are cached whole |
| 1.3 `nextjs-blueprint-shows-topology` | Every `<Suspense>` is written in `page.tsx` or in a section file, with the module's `.Skeleton` as the fallback. What to do when the task must not change what streams |
| 1.4 `nextjs-namespace-and-server-root` | A namespace file with no `"use client"`, an async root that seeds a client provider, client leaves by default. `<stem>.client.tsx` for one interactive part, `.server.tsx` for a server twin |
| 1.5 `nextjs-states-gates-and-variants` | Gates for browser state, early returns for nothing-to-show, `<stem>.variants.tsx` for server-decided screens |
| 1.6 `nextjs-layout-is-a-blueprint` | A sync layout that holds the chrome, `<stem>.layout.metadata.ts`, access checks that stay where they are, and the root layout that awaits the locale |
| 1.7 `nextjs-sections-folder` | A page that lists sections keeps them in `sections/` with the route stem. No wrapper markup in the page, a section may own its boundary, and the page root is `<main>` |

Suffixes this skill adds to the shared list: `.metadata.ts`, `.layout.metadata.ts`,
`.skeleton.tsx`, `.variants.tsx`, `.client.tsx`, `.server.tsx`.

Verified against Next.js 16.3 with `cacheComponents: true`. `fixtures/next/`
in the source repo builds every rule in one app.
