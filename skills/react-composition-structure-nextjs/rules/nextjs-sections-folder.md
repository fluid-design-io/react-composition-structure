---
title: A page lists sections from sections/
slug: nextjs-sections-folder
group: Next.js App Router
groupNumber: 1
section: "1.7"
impact: HIGH
tags: nextjs, sections, page, landmark, role-folders
---

## A page lists sections from sections/

A page that is a list of sections keeps every section in a `sections/`
folder beside `page.tsx`. The segment root then holds the page, its routing
files, and nothing a reader has to skip.

```text
app/pricing/
  page.tsx
  pricing.metadata.ts
  opengraph-image.png
  sections/
    pricing.hero.tsx
    pricing.plans.tsx
    pricing.plans.constants.ts
    pricing.faq.tsx
    pricing.checkout.tsx
    images/
```

```tsx
// page.tsx
import { PricingCheckout } from "./sections/pricing.checkout"
import { PricingFaq } from "./sections/pricing.faq"
import { PricingHero } from "./sections/pricing.hero"
import { PricingPlans } from "./sections/pricing.plans"

export { generateMetadata } from "./pricing.metadata"

export default function PricingPage() {
  return (
    <main>
      <PricingHero />
      <PricingPlans />
      <PricingFaq />
      <PricingCheckout />
    </main>
  )
}
```

**Bad: the page wraps some sections and inlines others**

```tsx
<main>
  <PricingHero />
  <Section variant="muted">
    <Container>
      <PricingPlans />
    </Container>
  </Section>
  <Section>
    <Container>
      <Suspense fallback={<CheckoutSkeleton />}>
        <Checkout slug="pro">
          <div className="grid gap-8">
            <Checkout.Title />
            <Checkout.Action />
          </div>
        </Checkout>
      </Suspense>
    </Container>
  </Section>
</main>
```

A reader cannot tell a section from its wrapper, and the last block is a
section that was never named.

**Every child of the root is one named section**

Layout wrappers such as `<Section>` and `<Container>` go inside the section
file. So does any markup the section needs around a shared component. When
the page wants to wrap something, that thing is a section and gets a file.
Shared sections from `components/<domain>/` sit in the same list.

**Always create the folder**

Create `sections/` for every page of this kind, even when it has one
section. The shared rule that waits for three files does not apply here,
because the gain is that every route reads the same way. `sections/` has no
`index.ts`, and the page imports each file by its path.

**Files keep the route stem**

Files in `sections/` keep the route's stem and do not reset to the folder
name. `sections/pricing.hero.tsx` exports `PricingHero`. A reset would put a
`sections.hero.tsx` in every route, which makes file search, editor tabs,
and stack traces useless. This is the one folder where the stem does not
reset. Every section is a named export, and the name is the stem plus the
suffix.

Parts that only one section uses sit beside it in `sections/` and share its
name, as `pricing.plans.constants.ts` does. When three or more files share
that prefix, nest them as the shared rule says
(`sections/plans/plans.table.tsx`). Three or more parts that several
sections share go in `sections/parts/`, as `parts.image-frame.tsx`. Images
that sections import move with them. Metadata image files stay in the segment root, where the router looks
for them.

**What stays beside `page.tsx`**

`sections/` holds what the page root lists. The namespace file, the
provider, gates, the skeleton, `<stem>.metadata.ts`, and `<stem>.server.ts`
stay beside `page.tsx`. A route with the full module shape from the top of
this skill has no `sections/` unless its page also lists static sections.

**A section may own its boundary**

A section that streams writes its own `<Suspense>` and error boundary,
around one async component, with that module's `.Skeleton` as the fallback.
The page shows `<PricingCheckout />` and stays a list. The section file is
the only place below the page where a boundary may sit. Parts and leaves
never wrap themselves (see `nextjs-blueprint-shows-topology.md`).

```tsx
// sections/pricing.checkout.tsx
export function PricingCheckout() {
  return (
    <Section>
      <Container>
        <CheckoutErrorBoundary>
          <Suspense fallback={<Checkout.Skeleton />}>
            <Checkout slug="pro">
              <Checkout.Card />
            </Checkout>
          </Suspense>
        </CheckoutErrorBoundary>
      </Container>
    </Section>
  )
}
```

When two routes write the same block inside the boundary, that block is
shared UI. Move it to `components/<domain>/` and keep one copy.

**The page root is the main landmark**

The root element of every page is `<main>`, or the repo's own component
that renders it. Write it in `page.tsx`. Never write it inside a section, a
root, or a namespace file, and never use a fragment as the page root. A
page header that must sit flush with the top still goes inside `<main>`.
Change the padding, not the landmark. When a layout already renders
`<main>` around `children`, the page root is a fragment or a `<div>`, and
no page under that layout renders a second one.

A task that only moves files keeps the DOM it found. Tell the user which
pages have no `<main>`, or have it inside a module file.

**Checklist**

- Is every child of the page root one named section, with no wrapper markup
in the page?
- Do all sections live in `sections/`, with the route stem and named
exports?
- Do module wiring and routing files stay beside `page.tsx`?
- Does a boundary below the page sit only in a section file, around one
async component?
- Is the page root the `<main>` landmark, exactly once per route?

**Official docs:** `project-structure` (Colocation), `page`,
`instant-navigation`.
