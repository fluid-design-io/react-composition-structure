---
name: react-composition-structure
description: React and React Native file-system architecture patterns that scale. Use when restructuring component folders or route-bound domain modules (a calendar, cart, or checkout module under `components/`, `screens/`, or any repo tree, not a literal `features/` directory), composing screens as blueprints with `*.states.tsx` state gates, grouping long flat modules into role folders, cleaning up `index.ts` export boundaries, normalizing naming conventions, colocating `*.data.ts` files, or translating composition patterns into repo structure.
metadata:
  author: oliverpan
  version: 1.1.0
---

# React Composition Structure

File-system and module-boundary patterns for React and React Native codebases.
This skill complements `vercel-composition-patterns`: Vercel explains the
component architecture; this skill explains how to express those patterns in a
codebase's folders, files, exports, and naming.

## Primitives

The rules share a small platform-neutral vocabulary. Nothing in it touches a
platform API, so each pattern applies to React DOM and React Native alike.
Examples pick whichever platform reads clearest and translate 1:1.

- **Root**: the provider-wrapping component a module's namespace hangs off
- **Leaf**: one named part consumers compose (`Composer.Input`)
- **Gate**: a leaf that reads module context and returns `null` unless its
state holds; lives in `<stem>.states.tsx`
- **Nested namespace**: a leaf with named subparts, assembled with
`Object.assign` in the leaf's own file (`Activity.Header.Address`)
- **Blueprint**: a screen file that is nothing but a declarative tree of
leaves and gates, with design notes as doc comments on the subtree they govern
- **Subflow folder**: a nested folder owning a real flow, with its own
public API
- **Role folder**: a nested folder shelving peers of one kind (`layout/`),
with no local barrel

## Scaling ladder

Structure is a response to measured growth, not ceremony. Each step names the
rule to read when its trigger fires:

1. **One file.** A small presentational component stays flat; no folder.
2. **Compound folder.** Multiple named leaves or shared state. Read
`architecture-compound-component-folders`.
3. **Gates and blueprint.** A second render state appears. Add
`<stem>.states.tsx` and keep screens declarative. Read
`architecture-screen-blueprints`.
4. **Nested namespace.** A leaf grows named subparts. Assemble them in the
leaf's own file; same rule file as step 3.
5. **Subflow folder.** Three or more files share a sub-prefix. Read
`organization-nest-when-prefix-repeats`.
6. **Role folder.** The flat listing passes about a dozen files with no
repeating prefix. Read `organization-group-by-role`.

## When to apply

Reference these guidelines when:

- Restructuring reusable component folders
- Refactoring pages or screens into route-bound domain modules
- Cleaning up over-exported `index.ts` files
- Normalizing naming conventions across a module
- Deciding where context, data orchestration, and docs should live

## Quick reference

### 1. Component folders (HIGH)

- `architecture-compound-component-folders`: Organize shared multi-part
components around one root namespace, clear file ownership, and provider-led
state sharing

### 2. Route-bound module folders (HIGH)

- `architecture-route-bound-module-folders`: Organize pages and screens into
foldered domain modules (wherever the repo groups route-bound UI) with thin
route wrappers and colocated `*.data.ts`
- `architecture-screen-blueprints`: Compose screens as declarative
blueprints of gates and leaves, with self-gating `*.states.tsx` files and
design notes on the subtree they govern

### 3. Public API boundaries (MEDIUM)

- `boundaries-public-api`: Export one module root by default and keep leaves
internal unless they are intentionally public

### 4. Naming stems and suffixes (MEDIUM)

- `naming-stems-and-suffixes`: Keep one module stem, use explicit suffixes, and
preserve strong repo conventions instead of mixing naming systems

### 5. Organization heuristics (MEDIUM)

- `organization-nest-when-prefix-repeats`: Promote repeated filename prefixes
into a nested folder with an `index.ts` public boundary once 3+ files share
the stem
- `organization-group-by-role`: Group peer leaves into role folders
(`layout/`, `widgets/`) once a flat module passes about a dozen files with no
repeating prefix; no local barrel, root `index.ts` stays the boundary
- `organization-colocate-internals`: Keep helpers/data/types with their
consumer, and tests in module-local `__test__/` folders, until a second
consumer proves the need to lift

## How to use

Read the single rule file that matches the job:

```text
rules/architecture-compound-component-folders.md
rules/boundaries-public-api.md
```

Each rule file contains:

- A single main concern
- Why it matters
- Bad and good examples
- File trees or code samples
- Practical exceptions and checklists

## Full compiled document

For the complete guide with all rules expanded: `AGENTS.md`.

`AGENTS.md` is generated from `rules/*.md` (plus `metadata.json` and
`templates/agents.head.md`). Edit the rule files, then run `npm run build` to
regenerate it. Never edit `AGENTS.md` by hand.
