---
title: Assemble the namespace on the server and seed a client provider
slug: nextjs-namespace-and-server-root
group: Next.js App Router
groupNumber: 1
section: "1.4"
impact: HIGH
tags: nextjs, server-components, use-client, compound-components, serialization
---

## Assemble the namespace on the server and seed a client provider

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
