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
- The page holds the whole tree. No `<stem>.screen.tsx` exists unless two
routes share the screen.
- Every `<Suspense>` is in the page, with the module's `.Skeleton` as the
fallback.
- `orders.tsx` has no `"use client"`. Its async root awaits `params`, reads
data, and passes plain data to the client provider.
- A page with no request data is a list of server components, with no
provider and no `<Suspense>`.

## Rules

Read rules 1.1 to 1.4 before you add or restructure a route. Read rule 1.5
when the route has more than one state.

| Rule | Covers |
| --- | --- |
| 1.1 `nextjs-segment-is-the-module` | Module files sit in the route segment, with no `index.ts`. Where shared UI goes |
| 1.2 `nextjs-page-is-the-blueprint` | A sync `page.tsx` that holds the tree, passes `params` down as a promise, and re-exports routing exports from `<stem>.metadata.ts` |
| 1.3 `nextjs-blueprint-shows-topology` | Every `<Suspense>` is written in `page.tsx`, with the module's `.Skeleton` as the fallback |
| 1.4 `nextjs-namespace-and-server-root` | A namespace file with no `"use client"`, an async root that seeds a client provider, client leaves by default |
| 1.5 `nextjs-states-gates-and-variants` | Gates for browser state, early returns for nothing-to-show, `<stem>.variants.tsx` for server-decided screens |

Suffixes this skill adds to the shared list: `.metadata.ts`, `.skeleton.tsx`,
`.variants.tsx`.

Verified against Next.js 16.3 with `cacheComponents: true`. `fixtures/next/`
in the source repo builds every rule in one app.
