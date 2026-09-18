---
title: Keep one stem and use responsibility-driven suffixes
slug: naming-stems-and-suffixes
group: Naming stems and suffixes
groupNumber: 4
section: "4.1"
impact: MEDIUM
tags: naming, file-stems, suffixes, conventions
---

## Keep one stem and use responsibility-driven suffixes

A file name states who owns the file and what job it does. Every file in a
folder repeats the folder's stem and adds one suffix for its job.

**Bad: mixed naming inside one folder**

```text
checkout/
  index.tsx
  useCheckout.ts
  CheckoutScreen.tsx
  helpers.ts
  types.ts
```

The files share no stem, and `helpers.ts` and `types.ts` name no owner.

**Good: one stem plus explicit suffixes**

```text
checkout/
  checkout.tsx
  checkout.screen.tsx
  checkout.data.ts
  checkout.summary.tsx
  checkout.types.ts
  index.ts
```

The path maps to the component name. `composer/composer.input.tsx` exports
`ComposerInput`, and `composer/index.ts` exports the `Composer` namespace, so
nobody has to search for where `Composer.Input` lives.

**The stem resets at each folder**

A nested folder uses its own name as the stem.
`checkout/billing/billing.form.tsx` is correct.
`checkout/billing/checkout.billing.form.tsx` is not. Role folders reset the
same way, as in `composer/layout/layout.close-button.tsx`.

**A stem never crosses into another module**

Files and component names carry their own module's stem. `PayLinkState*`
components inside `pay-share-link/` make a search for either stem land in two
modules. Rename to the owning stem whenever you touch such a file.

**Suffixes**

- `.screen.tsx` for route-facing screens, or `.page.tsx` in repos that say
page
- `.data.ts` for module-owned orchestration
- `.params.ts` for route-param parsing
- `.types.ts` for shared types
- `.context.tsx` for provider wiring
- `.states.tsx` for gates (see `architecture-screen-blueprints.md`)
- `.display.tsx` and `.actions.tsx` for read-oriented and interactive leaves
- `.functions.ts` for server function wrappers that any file may import
- `.server.ts` for code that must never reach a client bundle
- `.utils.ts` and `.constants.ts` for pure helpers and static configuration
- `.md` for documentation scoped to the module

**Keep a coherent existing convention**

If a repo already uses PascalCase files or another consistent style, keep
that style and apply the structure. Keep one stem, one job per file, and one
public boundary. A second naming system in one repo costs more than either
style alone.

**Checklist**

- Do all files in the folder share its stem?
- Do component names carry this module's stem?
- Does each suffix name one job?
- Are generic names such as `helpers.ts` gone?
- Did an existing coherent convention survive?
