---
title: Keep the module outside app/ and re-export the screen
slug: expo-module-outside-app
group: Expo Router
groupNumber: 1
section: "1.1"
impact: HIGH
tags: expo-router, placement, route-files, platform-extensions
---

## Keep the module outside app/ and re-export the screen

Expo Router turns every file under `app/` into a route, apart from
`_layout.tsx` and the `+` files such as `+not-found.tsx`. A leaf or a data
file placed there becomes a screen with a URL. So an Expo app uses the
default placement from the shared skill
(`../react-composition-structure/rules/placement-separate-tree.md`). Read
that rule first. This rule adds what is specific to Expo Router.

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    checkout.tsx          // one-line route file
screens/
  checkout/
    checkout.tsx
    checkout.screen.tsx
    checkout.states.tsx
    checkout.data.ts
    index.ts
```

**The route file**

```tsx
export { CheckoutScreen as default } from "@/screens/checkout"
```

A route file gains a body only for exports that Expo Router reads from that
file, such as `unstable_settings` or `ErrorBoundary`, and for a doc comment
about the URL. Navigator options belong in the `_layout.tsx` that owns the
navigator.

**The module reads its own params**

Call `useLocalSearchParams` in `<stem>.data.ts` or `<stem>.context.tsx`. The
route file stays one line because it never touches params.

**One screen, several route files**

Two route files can re-export the same screen. Use this for a modal and a
push presentation of one screen, and for a catch-all route beside its bare
segment. The screen does not change.

**Platform files stay in the module**

The platform extension goes last, after the job suffix:

```text
checkout.map.tsx
checkout.map.ios.tsx
checkout.map.web.tsx
```

Keep these files in the module. A platform-specific route file inside `app/`
needs a base file beside it, and the module has no such requirement.

**Bad: module files under app/**

```text
app/
  checkout/
    index.tsx
    checkout.list.tsx       // Expo Router serves this as /checkout/checkout.list
    checkout.data.ts        // and warns that this route has no default export
```

**Checklist**

- Does `app/` hold only route files, `_layout.tsx` files, and `+` files?
- Is each route file one line, plus any export Expo Router reads from it?
- Does the module read params itself?
- Do platform files sit in the module with the extension last?

**Official docs:** https://docs.expo.dev/router/basics/notation/,
https://docs.expo.dev/router/advanced/platform-specific-modules/.
