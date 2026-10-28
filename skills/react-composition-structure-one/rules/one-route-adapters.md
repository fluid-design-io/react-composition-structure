---
title: Keep route contracts separate from screen modules
slug: one-route-adapters
group: One framework
groupNumber: 1
section: "1.1"
impact: HIGH
tags: one, routing, placement, exports
---

## Keep route contracts separate from screen modules

Find the owning package's route root: `app/`, or `router.root` in its
`one()` options. Keep screen internals outside that directory. The official
One skill gives the same advice. `router.ignoredRouteFiles` can exclude
colocated files, but it only accepts patterns that start with `**/*`. When
an existing package already colocates under a working exclusion, preserve
it unless the task changes placement.

```text
app/
  _layout.tsx
  orders/
    index.tsx
    [id]+ssr.tsx
src/screens/orders/
  orders.tsx
  orders.screen.tsx
  orders.context.tsx
  orders.data.ts
  orders.states.tsx
  orders.display.tsx
  index.ts
src/server/
  orders.server.ts
```

Use the package's established module tree; `src/screens` is an example.
Moving a route group should not move the domain module.

**Bad**

```text
app/orders/
  index.tsx
  orders.context.tsx
  orders.states.tsx
  orders.data.ts
```

This mixes discovery with private files without an exclusion policy.

**Good**

```tsx
export { OrdersScreen as default } from "@/screens/orders"
```

That is the default when no route exports or adapters are needed. A route
may declare a loader, static params, endpoint or other export One requires.
Keep its signature and location compatible with the installed compiler. Do
not hide framework exports in an unverified barrel to force a one-line entry.
The data-boundary rule covers a loader adapter.

Keep routing metadata and render-mode suffixes on the route. Modules never
import their routes. Give a navigable layout a deliberate entry screen and
verify initial navigation; an index file alone does not prove that behavior.
One also expects some route to match `/`, even inside a group.

`+api.ts` routes and `_middleware.ts` are server adapters. They parse the
request, call a server module and shape the response. Business logic lives
in that server module so a loader, an endpoint and a test can share it.
A `+not-found.tsx` follows the same thin-entry rule as a screen route.

Keep platform-specific module files outside the route root and import them
without the platform extension. Retain a route-level platform split when it
changes routing behavior. Leave generated route declarations, native projects
and native-source declarations owned by their generators.

**Checklist**

- Did the owning package and configured root decide placement?
- Are private files outside discovery or explicitly excluded?
- Are framework exports recognized by the installed One version?
- Can the module be imported without importing its route back?
- Do endpoint and middleware files delegate to server modules?
- Was the navigator's entry verified when its structure changed?

**Official docs**

https://onestack.dev/docs/routing
https://onestack.dev/docs/configuration
https://onestack.dev/docs/routing-loader
