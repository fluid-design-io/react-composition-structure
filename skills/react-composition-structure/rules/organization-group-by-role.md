---
title: Group peer leaves into role folders when a flat module grows long
slug: organization-group-by-role
group: Organization heuristics
groupNumber: 5
section: "5.2"
impact: MEDIUM
tags: file-organization, structure, refactoring
---

## Group peer leaves into role folders when a flat module grows long

The prefix-repeats trigger (`organization-nest-when-prefix-repeats.md`) never
fires on a module whose files all share one stem with unique suffixes. Such a
module can still grow past the point where a flat listing communicates
anything: twenty siblings sort into one alphabetical soup where wiring,
chrome, and domain sections interleave.

**Trigger:** the flat listing exceeds roughly a dozen files, no sub-prefix
repeats, and the files cluster by role. Move each cluster into a **role
folder** named for what its files *are* (`layout/` for first-party chrome,
`widgets/` for composable sections), not for a flow they own. The stem resets
to the folder name (`layout/layout.close-button.tsx`), per
`naming-stems-and-suffixes.md`.

**Bad: one stem, twenty siblings, no visible roles**

```text
composer/
  composer.amount-editor.tsx
  composer.amount-hero.tsx
  composer.amount-pad.tsx
  composer.close-button.tsx
  composer.context.tsx
  composer.counterparty-widget.tsx
  composer.currency-select.tsx
  composer.footer.tsx
  composer.funding-widget.tsx
  composer.hero-caption.tsx
  composer.method-widget.tsx
  composer.note-widget.tsx
  composer.offline-banner.tsx
  composer.quick-amounts.tsx
  composer.sheet.tsx
  composer.theme.ts
  composer.title.tsx
  composer.tsx
  composer.types.ts
  index.ts
```

Problems:

- role is invisible in the listing: wiring (`context`, `types`, `theme`),
chrome (`close-button`, `title`, `sheet`) and domain sections interleave
- the filename is the only place role can live, so names grow qualifier
chains (`hero`, `hero-caption`, `amount-hero`)
- scanning for "the file that draws X" means reading every name

**Good: root keeps the wiring; roles get folders**

```text
composer/
  composer.tsx
  composer.context.tsx
  composer.types.ts
  composer.theme.ts
  composer.sheet.tsx
  amount/
    amount.editor.tsx
    amount.hero.tsx
    amount.pad.tsx
    amount.quick-amounts.tsx
  layout/
    layout.close-button.tsx
    layout.title.tsx
    layout.footer.tsx
    layout.offline-banner.tsx
  widgets/
    widgets.counterparty.tsx
    widgets.currency-select.tsx
    widgets.funding.tsx
    widgets.method.tsx
    widgets.note.tsx
  index.ts
```

The assembly and state wiring stay at the root, so the namespace file is still
the first thing the listing shows. (`amount/` is the sibling trigger at work:
`composer.amount-*` repeated, so the prefix rule promoted it. Both triggers
routinely fire in the same module.)

**A role folder is not a subflow folder**

A subflow folder owns a flow: its own screens, data, and public API, and may
earn a local `index.ts` when parents consume it as a unit. A role folder just
shelves peers of the same kind:

- no local barrel; parents import leaves directly
(`./layout/layout.close-button`)
- the module root `index.ts` stays the only public boundary
- moving a file between role folders is a rename, not an API change

The no-barrel rule is not stylistic. A barrel couples every leaf into one
import graph, so importing one logic-only file drags every UI leaf and its
platform runtime along with it, which breaks lightweight test runners and
chunking. Both kinds of folder coexist in one module: a host module can hold
`pay/` and `guest/` as subflows beside `layout/` as a role folder.

**When not to group**

- a proposed folder would hold fewer than three files
- the role name says nothing (`misc/`, `components/`, `shared/` inside a
module); if no honest name exists, the cluster is not a role
- the flat listing still reads at a glance; length is the trigger, not
symmetry

**Checklist**

- Does the flat listing still read at a glance, or has it passed about a
dozen files with no repeating prefix?
- Does each folder name a real role with three or more members?
- Did the stem reset to the folder name?
- Do parents import role-folder leaves directly, with the module root
`index.ts` as the only public boundary?
