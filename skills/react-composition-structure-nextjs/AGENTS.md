# React Composition Structure for Next.js

Engineering  
September 2026  
Version 2.0.0

> Note:
> This guide adds Next.js App Router rules to the shared
> `react-composition-structure` skill. Read that skill first. It defines the
> vocabulary these rules use.

## Abstract

In the App Router a route's module lives in its segment, and `page.tsx` is
the blueprint. The page is a sync Server Component. It shows the static
shell, every streamed part, and every client gate in one tree. These rules
cover where files go and how the page reads. The official Next.js docs and
skills own rendering, caching, and prefetching, and they win any conflict.

## Table of Contents

1. [Next.js App Router](#1-nextjs-app-router) (HIGH)
  - 1.1 [The route segment is the module folder](#11-the-route-segment-is-the-module-folder)
  - 1.2 [page.tsx is the blueprint](#12-pagetsx-is-the-blueprint)
  - 1.3 [The blueprint shows what streams](#13-the-blueprint-shows-what-streams)
  - 1.4 [Assemble the namespace on the server and seed a client provider](#14-assemble-the-namespace-on-the-server-and-seed-a-client-provider)
  - 1.5 [Use gates for client state and variants for server state](#15-use-gates-for-client-state-and-variants-for-server-state)
  - 1.6 [layout.tsx is a blueprint of chrome](#16-layouttsx-is-a-blueprint-of-chrome)
  - 1.7 [A page lists sections from sections/](#17-a-page-lists-sections-from-sections)

## 1. Next.js App Router

### 1.1 The route segment is the module folder

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

### 1.2 page.tsx is the blueprint

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

**The page component is named `<Stem>Page`**

`orders/[id]/page.tsx` exports `OrdersPage`. A page copied from another
route keeps the old name until someone reads a stack trace, so rename it
when you touch the file. The root element is the `<main>` landmark (see
`nextjs-sections-folder.md`).

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
blueprint is a list of server components. They live in `sections/`, and the
page holds no wrapper markup around them (see `nextjs-sections-folder.md`):

```tsx
import { BenefitsHero } from "./sections/benefits.hero"
import { BenefitsRewards } from "./sections/benefits.rewards"
import { BenefitsSecurity } from "./sections/benefits.security"

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
- Does the file have zero conditionals, zero data reads, and no
commented-out JSX?
- Is the component named `<Stem>Page`, with `<main>` as its root?

**Official docs:** `page` (params, searchParams), `generate-metadata`,
`migrating-to-cache-components`, `use-cache`, `data-security`,
`authentication`.

### 1.3 The blueprint shows what streams

A Next.js route has a static shell and parts that stream into it. Write every
`<Suspense>` boundary in `page.tsx`, so a reader sees which parts stream
without opening a leaf.

**Bad: the leaf hides its own boundary**

```tsx
// orders.history.tsx
export function OrdersHistory({ params }: Props) {
  return (
    <Suspense fallback={<Spinner />}>
      <OrdersHistoryList params={params} />
    </Suspense>
  )
}
```

```tsx
// page.tsx
<Orders.History params={params} />
```

The page reads as if the history were static.

**Good: the boundary is in the blueprint**

```tsx
<main>
  <h1>Your orders</h1>
  <Suspense fallback={<Orders.Skeleton />}>
    <Orders params={params}>
      <Orders.Summary />
    </Orders>
  </Suspense>
  <Suspense fallback={<OrdersHistory.Skeleton />}>
    <OrdersHistory params={params} />
  </Suspense>
</main>
```

**A boundary inside a static section**

A page that lists sections stays a list. The section that streams owns its
boundary, one level below the page, and the page shows `<BenefitsPricing />`:

```tsx
// sections/benefits.pricing.tsx
export function BenefitsPricing() {
  return (
    <section>
      <h2>Pricing</h2>
      <Suspense fallback={<BenefitsPrice.Skeleton />}>
        <BenefitsPrice />
      </Suspense>
    </section>
  )
}
```

The section's static markup stays in the shell. A reader who wants to know
what streams opens `page.tsx` and then the files in `sections/`, and never
goes deeper. A route with the full module shape keeps every boundary in the
page, as in the example above.

**Rules for boundaries**

- A leaf never wraps itself in `<Suspense>` or in an error boundary. Both
are written in the page. The one other place is a section file in
`sections/`, on a page that is a list of sections (see
`nextjs-sections-folder.md`).
- Each boundary wraps one async component. Two reads get two boundaries.
- Anything that renders the same in the fallback and the result goes above
the boundary. The page heading always does.
- The fallback is the module's own skeleton, attached to the namespace as
`.Skeleton` and defined in `<stem>.skeleton.tsx`. Do not write a second
skeleton that mirrors the page layout.
- `loading.tsx` is the router's boundary for the whole segment. When a
segment has one, do not add a module skeleton for the same state.

**When the task must not change what streams**

A new `<Suspense>` changes what the route sends first. A task that only
moves files may not do that. When the old page awaits outside any boundary,
make the page sync, move the await into the async root, and add no boundary
around the root. A boundary that the old page had further down stays where
it is in the tree. The page then shows one root with no fallback, which is
how the route already behaved.

Tell the user which routes ended this way, because each one still blocks on
its root. Do the same with anything else the task did not ask you to fix,
such as an import that climbs two levels. Report it and leave it.

**A skeleton that is one element still gets its file**

When the fallback is a single generic element, such as
`<Skeleton className="h-96" />`, still write `<stem>.skeleton.tsx` and attach
it as `.Skeleton`. Every fallback in every page then reads
`<Orders.Skeleton />`, and a reader never has to ask whether an inline
fallback belongs to the module.

Where a boundary goes, what to cache, and what to prefetch are rendering
decisions. The official Next.js docs and skills decide them. This rule only
says that the result is written in `page.tsx`.

**Checklist**

- Is every `<Suspense>` in the route written in `page.tsx`, or in a section
file on a page that lists sections?
- Is each fallback the wrapped module's `.Skeleton`, even when it is one
element?
- If the task may not change what streams, did you add no boundary and tell
the user which roots still block?
- Do the heading and other static parts sit above the boundaries?

**Official docs:** `instant-navigation`, `migrating-to-cache-components`,
`loading`.

### 1.4 Assemble the namespace on the server and seed a client provider

`page.tsx` is a Server Component, and it uses dot access such as
`<Orders.Summary />`. That works only when the file that assembles the
namespace has no `"use client"` directive.

**Bad: the directive is on the namespace file**

```tsx
// orders.tsx
"use client"

export const Orders = Object.assign(OrdersRoot, { Summary: OrdersSummary })
```

The page typechecks. At prerender `Orders.Summary` is `undefined` and the
build fails with "Element type is invalid".

**Good: the directive is on the files that need it**

```tsx
// orders.tsx, no directive
import { OrdersProvider } from "./orders.context"   // "use client"
import { OrdersItems, OrdersSummary } from "./orders.display"  // "use client"
import { OrdersSkeleton } from "./orders.skeleton"
import { getOrder, getViewer } from "./orders.server"

async function OrdersRoot({ params, children }: OrdersRootProps) {
  const { id } = await params
  const [order, viewer] = await Promise.all([getOrder(id), getViewer()])
  if (!order) return <OrdersEmpty />

  return <OrdersProvider seed={{ order, viewer }}>{children}</OrdersProvider>
}

export const Orders = Object.assign(OrdersRoot, {
  Summary: OrdersSummary,
  Items: OrdersItems,
  Skeleton: OrdersSkeleton,
})
```

The root is an async Server Component. It awaits the params promise, reads
data, and seeds the provider.

**The root seeds `state`, and the provider builds `actions`**

Props that go from a Server Component to a Client Component must serialize.
So the root passes plain data as `seed`. The client provider in
`<stem>.context.tsx` turns the seed into `state` and creates `actions` and
`meta` itself. A function from the server can only be a Server Action.

```tsx
// orders.context.tsx
"use client"

export function OrdersProvider({ seed, children }: OrdersProviderProps) {
  const [expanded, setExpanded] = useState(false)
  const value = {
    state: { ...seed, expanded },
    actions: { toggle: () => setExpanded((open) => !open) },
    meta: {},
  }

  return <OrdersContext value={value}>{children}</OrdersContext>
}
```

For the same reason, pass elements as `children`. Never pass a render
function across the server and client boundary.

**Leaves are Client Components by default**

A leaf with no props reads context, and only a Client Component can read
context. Make a leaf a Server Component when it is large and static, such as
a rich-text body. That leaf takes the same `params` promise as the root and
calls the same cached function in `<stem>.server.ts`.

**A route with no client state needs no provider**

Many dynamic routes only read data and render it. Such a route has no
context, so its leaves cannot be prop-less. `<stem>.tsx` holds one async
root that awaits `params`, reads data, and renders Server Component leaves
with props:

```tsx
// post.tsx
async function PostRoot({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  return (
    <article>
      <PostHeader title={post.title} author={post.author} />
      <PostBody content={post.content} />
    </article>
  )
}

export const Post = Object.assign(PostRoot, { Skeleton: PostSkeleton })
```

The page is unchanged. It still wraps the root in a boundary, because the
root still awaits:

```tsx
<Suspense fallback={<Post.Skeleton />}>
  <Post params={params} />
</Suspense>
```

The page shows where the route streams. The root shows what the route is
made of. Add a provider when the first piece of client state appears, not
before.

**A small component splits into `<stem>.tsx` and `<stem>.client.tsx`**

A component with no provider often needs one interactive part, such as a
menu that reads server data and opens on a tap. The server half keeps the
plain name, because it is the file consumers import. The interactive half
is `<stem>.client.tsx` and starts with `"use client"`:

```text
nav-mobile.tsx           // async, reads data, renders <NavMobileClient>
nav-mobile.client.tsx    // "use client", state and handlers
```

The server half passes plain data as props and server-rendered parts as
`children`. Only the server half imports the client half. A stem gets one
`.client.tsx`. When a second client file appears, the component has grown
into a module, and its client files take the role suffixes (`.context.tsx`,
`.display.tsx`, `.actions.tsx`).

Do not mark ordinary Server Components with `.server.tsx`. A file with no
directive already renders on the server unless a client file imports it, so
the suffix would end up on every file. Use `.server.tsx` for one case. Two
components share a name and an API, one for each side, such as a
`SignedIn` that awaits the session and a `SignedIn` that reads a hook:

```text
auth-state.server.tsx    // import "server-only", async
auth-state.client.tsx    // "use client"
```

The suffix and the first line always agree. `.client.tsx` starts with
`"use client"`, and `.server.ts` or `.server.tsx` starts with
`import "server-only"`, so importing the wrong twin fails the build and does
not fail in the browser. The folder's `index.ts` exports one twin at most,
and the doc comment on each names the other.

**Server-only code lives in `<stem>.server.ts`**

The file starts with `import "server-only"`. It holds the module's data
functions, including the ones marked `"use cache"`.

Write the import even when `server-only` is not in `package.json`. Next.js
handles the import itself and does not read the npm package, so the build
passes without it. Offer to install the package only when the repo's linter
flags the import as an undeclared dependency.

Server Actions live in `<stem>.functions.ts`, which starts with
`"use server"`. Do not name that file `<stem>.actions.ts`. In the shared
suffix list `.actions.tsx` means interactive leaves, and two meanings for one
word cost every reader a second look.

**Checklist**

- Is `<stem>.tsx` free of `"use client"`?
- Does the root pass only serializable data to the provider?
- Does the client provider create `actions`?
- Is each Server Component leaf under a provider large and static?
- Does a route with no client state skip the provider?
- Does every `.client.tsx` start with `"use client"`, and every `.server.*`
file with `import "server-only"`?

**Official docs:** `server-and-client-components` (Passing data from Server
to Client Components, Interleaving Server and Client Components, Context
providers, Preventing environment poisoning), `use-client`, `use-cache` (Serialization), `data-security`.

### 1.5 Use gates for client state and variants for server state

A gate reads context, so a gate is a Client Component. It can only express
state the browser knows. State that the server decides needs a different
form.

| The state comes from | Write it as | In |
| --- | --- | --- |
| the browser: offline, an optimistic update, a refetch, an open panel | a gate | `<stem>.states.tsx` |
| server data, and there is nothing to show: not found, empty, not entitled | an early return in the root, or `notFound()` | `<stem>.tsx` |
| server data, and each state is a different screen | explicit variants | `<stem>.variants.tsx` |

A `notFound()` call inside a streamed root runs after the shell has started
to send. Read the `not-found` doc for what that does to the response status
before you rely on it, and ask the user if the route needs a real 404.

**Variants**

When server data picks between different screens, write each screen as its
own declarative tree. One async switch component picks between them. This is
the "explicit variants" pattern from Vercel's composition patterns guide,
rule 3.1.

```tsx
// invite.variants.tsx
export async function InviteVariant({ params }: InviteProps) {
  const invite = await getInvite((await params).token)

  if (invite.status === "expired") return <InviteExpired />
  if (invite.status === "accepted") return <InviteAccepted invite={invite} />
  return <InvitePending invite={invite} />
}

function InvitePending({ invite }: { invite: Invite }) {
  return (
    <Invite seed={invite}>
      <Invite.Sender />
      <Invite.Accept />
    </Invite>
  )
}
```

```tsx
// page.tsx
<Suspense fallback={<Invite.Skeleton />}>
  <InviteVariant params={params} />
</Suspense>
```

The switch is the only place that branches. A reader opens one file and sees
every screen the route can show.

**Bad: a config array of render functions**

```tsx
const STEPS = [
  { status: "pending", component: (invite) => <InvitePending invite={invite} /> },
  { status: "expired", component: () => <InviteExpired /> },
]
```

The screens hide inside data. Nobody can read the route's states without
running the lookup in their head.

**A gate hides content. It does not protect it**

The server renders the children of a client gate and sends them to the
browser whether or not the gate shows them. Never put content the viewer must
not receive under a gate. Decide that on the server, in the root or the
switch.

**Checklist**

- Does every gate express state that only the browser knows?
- Are nothing-to-show cases early returns in the root?
- Does one switch in `<stem>.variants.tsx` pick between server-decided
screens?
- Is every access decision made on the server?

**Official docs:** `server-and-client-components` (Interleaving Server and
Client Components), `data-security`, `not-found`.

### 1.6 layout.tsx is a blueprint of chrome

A layout follows the page rules. It is a sync component that holds one tree,
the chrome around `children`. It renders `children` unconditionally.

```tsx
export { metadata } from "./shop.layout.metadata"

export default function ShopLayout({ children }: LayoutProps<"/shop">) {
  return (
    <div>
      <ShopHeader />
      <Suspense fallback={<ShopCart.Skeleton />}>
        <ShopCart />
      </Suspense>
      {children}
      <ShopFooter />
    </div>
  )
}
```

**Where a layout's files go**

Files that only the layout uses sit in the layout's segment and carry its
stem. Chrome that several layouts share lives in `components/<domain>/`.

**Layout metadata has its own file**

A layout re-exports its routing exports from `<stem>.layout.metadata.ts`.
The page in the same segment keeps `<stem>.metadata.ts`, so the two never
collide.

**Do not move a check that guards access**

A layout that awaits a session and redirects is doing security work. Moving
that check, or wrapping it in `<Suspense>`, can change what it guarantees.
Leave it where it is, tell the user what you found, and ask how they want it
handled. The official docs cover where such checks belong.

**A root layout that awaits the locale stays async**

A root layout that awaits the locale to set `<html lang>` cannot go sync.
The attribute is on the outermost element, so no child component can take
the await. Keep that one await in the layout and move every other read out
of it.

**Checklist**

- Is the layout sync, or async only for the `<html lang>` await, with
`children` rendered unconditionally?
- Is every boundary in the layout written in the layout?
- Does layout metadata live in `<stem>.layout.metadata.ts`?
- Did every access check stay where it was, with the user told about it?

**Official docs:** `layout`, `data-security`, `authentication`.

### 1.7 A page lists sections from sections/

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
