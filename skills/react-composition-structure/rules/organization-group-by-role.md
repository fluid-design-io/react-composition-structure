---
title: Group peer leaves into role folders when a flat module grows long
slug: organization-group-by-role
group: Organization heuristics
groupNumber: 5
section: "5.2"
impact: MEDIUM
tags: file-organization, role-folders, heuristics
---

## Group peer leaves into role folders when a flat module grows long

The prefix trigger (`organization-nest-when-prefix-repeats.md`) never fires
on a module whose files all share one stem with unique suffixes. That module
can still grow until the flat listing tells a reader nothing.

**Trigger:** the flat listing passes about a dozen files, no prefix repeats,
and the files cluster by role. Move each cluster into a role folder named for
what its files are (`layout/` for chrome, `widgets/` for composable
sections). The stem resets to the folder name.

**Bad: one stem, twenty siblings**

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

Wiring, chrome, and domain sections interleave. The file name is the only
place a role can live, so names grow qualifier chains (`amount-hero`,
`counterparty-widget`).

**Good: the root keeps the wiring and roles get folders**

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

The namespace file is still the first thing in the listing. `amount/` came
from the prefix trigger, because `composer.amount-*` repeated. Both triggers
often fire in one module.

**A role folder is not a subflow folder**

A subflow folder owns a flow, with its own screens, data, and public API. A
role folder holds peers of one kind:

- it has no `index.ts`, and parents import its leaves directly
(`./layout/layout.close-button`)
- the module root `index.ts` stays the only public boundary
- moving a file between role folders is a rename, not an API change

A barrel in a role folder joins every leaf into one import graph. Importing
one logic-only file then loads every UI leaf and its platform runtime, which
breaks lightweight test runners and code splitting.

**When not to group**

- a folder would hold fewer than three files
- the only available name says nothing, such as `misc/`, `components/`, or
`shared/` inside a module
- the flat listing still reads at a glance

**Checklist**

- Has the flat listing passed about a dozen files with no repeating prefix?
- Does each folder name a role with three or more members?
- Did the stem reset to the folder name?
- Do parents import role-folder leaves directly?
