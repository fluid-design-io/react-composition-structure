---
title: Keep the module in a -stem folder beside the route file
slug: tanstack-module-beside-route
group: TanStack Start
groupNumber: 1
section: "1.1"
impact: HIGH
tags: tanstack-start, tanstack-router, placement, loaders, server-functions
---

## Keep the module in a -stem folder beside the route file

The route generator treats every file under `src/routes/` as a route, unless
its name or a folder above it starts with `-`. The route file must export
`Route` from `createFileRoute(...)`, and the router reads the loader, search
validation, and head from that object. So the module lives in one `-<stem>/`
folder beside the route file, and the route file connects the module's
exports to the `Route` options.

```text
src/routes/
  checkout/
    $id/
      index.tsx              // Route options, one line each
      -checkout/
        checkout.tsx
        checkout.screen.tsx  // the blueprint
        checkout.states.tsx
        checkout.data.ts
        checkout.functions.ts
        checkout.list.tsx
        index.ts
```

Inside `-checkout/` the module follows the shared rules. Files have plain
stem-dotted names and `index.ts` is the public boundary. Prefix the folder.
Never prefix the files.

**Why the folder needs the prefix**

This router reads a `.` in a file name as a path separator, so a stem-dotted
file outside a `-` folder is a route candidate:

- The generator fills an empty `src/routes/hazard/hazard.summary.tsx` with
route code and serves it at `/hazard/hazard/summary`.
- The generator skips a non-empty file that has no `Route` export, and prints
a warning on every build.

Create the `-<stem>/` folder first, then the files inside it.

**The route must be in directory form**

A flat route file such as `src/routes/orders.$id.tsx` has no folder of its
own, so a module has nowhere to sit beside it. Convert the route first:

```text
src/routes/orders.$id.tsx                  // flat
src/routes/orders/$id/index.tsx            // directory form
src/routes/orders/$id/-orders/             // sibling of the route file
```

Never keep the flat file and add a folder of the same name for the module.
With `orders.$id.tsx` beside `orders.$id/-orders/`, the import `./-orders`
resolves against `src/routes/` and fails. Use `route.tsx` in place of
`index.tsx` when the route is a layout with children. A small route with no
module stays flat.

**The route file connects, and the module owns**

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { CheckoutPending, CheckoutScreen, checkoutSearch, loadCheckout } from "./-checkout"

export const Route = createFileRoute("/checkout/$id/")({
  validateSearch: checkoutSearch,
  loader: ({ params }) => loadCheckout(params.id),
  pendingComponent: CheckoutPending,
  component: CheckoutScreen,
})
```

Each option is one line that names a module export. `index.ts` exports what
the route file uses and nothing more.

The generator owns the string in `createFileRoute("...")`. It rewrites the
string from the file's location on the next dev or build run. After you move
a route folder, run the generator. Never edit that string or
`routeTree.gen.ts` by hand.

**Where loader code lives**

- `<stem>.data.ts` holds the loader function, query options, and the hooks
that leaves read. A loader runs on the server for the first request and in
the browser on later navigations, so this file never touches a database, a
secret, or a Node-only API.
- `<stem>.functions.ts` holds `createServerFn` wrappers. Any file may import
them, and a loader calls them to reach the server.
- `<stem>.server.ts` holds server-only helpers. Only server function handlers
import it.

**The module reads route state through `getRouteApi`**

The route file imports the screen, so the module cannot import `Route` back
without a circular import.

```ts
// checkout.data.ts
import { getRouteApi } from "@tanstack/react-router"

const route = getRouteApi("/checkout/$id/")

export function useCheckoutData() {
  const { id } = route.useParams()
  const cart = route.useLoaderData()

  return { id, cart }
}
```

This route id is the one string the module hard-codes. TypeScript checks it,
so `tsc` lists every stale id after a move. Keep every `getRouteApi` call in
the data or context file. Gates and leaves read module context.

**The router already has gates for the loader**

`pendingComponent`, `errorComponent`, and `notFoundComponent` cover a pending
or failed loader. Point them at module exports when they need custom UI. Do
not build `Checkout.Loading` for the same state. Gates in
`<stem>.states.tsx` cover state that exists after the loader resolves, such
as offline, empty, or a failed mutation.

**Sharing across routes**

A `-<stem>/` folder in the nearest common route folder serves sibling and
child routes. `src/routes/faculty/-faculty/` serves `faculty/index.tsx` and
`faculty/$id.tsx`. Components that belong to no route live in
`src/components/`.

**Checklist**

- Is the route in directory form, with one `-<stem>/` folder beside the route
file?
- Are the files inside `-<stem>/` unprefixed?
- Is every `Route` option one line that names a module export?
- Is the `createFileRoute` string untouched by hand?
- Does server-only code sit behind `createServerFn`?
- Does the module call `getRouteApi` in one file and never import `Route`?

**Official docs:**
https://tanstack.com/router/latest/docs/framework/react/routing/file-naming-conventions,
https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting,
https://tanstack.com/start/latest/docs/framework/react/guide/server-functions,
https://tanstack.com/start/latest/docs/framework/react/guide/execution-model.
