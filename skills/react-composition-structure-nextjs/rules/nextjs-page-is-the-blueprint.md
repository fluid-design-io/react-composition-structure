---
title: page.tsx is the blueprint
slug: nextjs-page-is-the-blueprint
group: Next.js App Router
groupNumber: 1
section: "1.2"
impact: HIGH
tags: nextjs, page, blueprint, metadata, params
---

## page.tsx is the blueprint

A reader opens `page.tsx` to learn what a route is made of. The file holds
the blueprint and one line of routing exports. It holds nothing else.

```tsx
import { Suspense } from "react"
import { Orders } from "./orders"

export { generateMetadata, generateStaticParams } from "./orders.metadata"

/** One order. The total streams in, the heading is in the static shell. */
export default function OrdersPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <main>
      <h1>Your order</h1>
      <Suspense fallback={<Orders.Skeleton />}>
        <Orders params={params}>
          <Orders.Summary />
          <Orders.Items />
        </Orders>
      </Suspense>
    </main>
  )
}
```

**The page component is sync**

The page never awaits. It passes `params` and `searchParams` down as the
promises it received, and the module's root awaits them. An `await` at the
top of a page blocks the whole route from prerendering.

A page that awaits only for a translation function, such as
`getTranslations` from `next-intl`, moves that call into the sections that
use the strings. Each section becomes an async Server Component and the page
goes sync. Keep the same function. Do not swap it for another API.

**A check that guards access stays in the page**

A page that awaits a session and calls `redirect()`, `unauthorized()`, or
`notFound()` is doing security work. Moving that check into a root can change
what it guarantees. Leave it where it is, even though the page stays async.
Tell the user what you found and ask how they want it handled. Layouts
follow the same rule (see `nextjs-layout-is-a-blueprint.md`).

**Routing exports come from `<stem>.metadata.ts`**

`generateMetadata`, `generateStaticParams`, `metadata`, and `viewport` live
in `<stem>.metadata.ts`. `page.tsx` re-exports them in one line. Do this for
every page that has a routing export, including pages where the metadata is three
lines long, so every `page.tsx` reads the same way. A page with no routing
exports gets no metadata file. An empty file tells the reader nothing. Segment config that Next.js reads as a literal
(`instant`, `prefetch`, `runtime`) stays in `page.tsx`.

**A static page is a list of sections**

A page with no request data needs no provider and no `<Suspense>`. Its
blueprint is a list of server components:

```tsx
export { generateMetadata } from "./benefits.metadata"

export default function BenefitsPage() {
  return (
    <main>
      <BenefitsHero />
      <BenefitsSecurity />
      <BenefitsRewards />
    </main>
  )
}
```

**A page that is itself cached**

Some pages mark their default export with `"use cache"` and read no request
data. Move that function whole into `<stem>.tsx`, with its directive, and
render it from a sync `page.tsx`. Do not split it and do not add a boundary.

**The one exception is a screen that two routes share**

When two routes render the same screen, put the blueprint in
`<stem>.screen.tsx` where both can reach it (see
`nextjs-segment-is-the-module.md`). Each `page.tsx` re-exports it:

```tsx
export { generateMetadata } from "./landing.metadata"
export { LandingScreen as default } from "@/components/marketing"
```

**Checklist**

- Does `page.tsx` hold only imports, one re-export line, and one tree?
- Is the page component sync, with `params` passed down as a promise?
- Did every access check stay where it was, with the user told about it?
- Do routing exports live in `<stem>.metadata.ts`, with no empty metadata
file?
- Does the file have zero conditionals and zero data reads?

**Official docs:** `page` (params, searchParams), `generate-metadata`,
`migrating-to-cache-components`, `use-cache`, `data-security`,
`authentication`.
