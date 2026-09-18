---
title: layout.tsx is a blueprint of chrome
slug: nextjs-layout-is-a-blueprint
group: Next.js App Router
groupNumber: 1
section: "1.6"
impact: MEDIUM
tags: nextjs, layout, chrome, metadata, auth
---

## layout.tsx is a blueprint of chrome

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

**Checklist**

- Is the layout sync, with `children` rendered unconditionally?
- Is every boundary in the layout written in the layout?
- Does layout metadata live in `<stem>.layout.metadata.ts`?
- Did every access check stay where it was, with the user told about it?

**Official docs:** `layout`, `data-security`, `authentication`.
