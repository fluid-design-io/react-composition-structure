---
name: react-composition-structure
description: File and folder structure for React and React Native codebases. Use when restructuring a component folder or a route-bound domain module (a calendar, cart, or checkout module), composing a screen as a blueprint with `*.states.tsx` gates, grouping a long flat module into role folders, cleaning up `index.ts` exports, normalizing file names, colocating `*.data.ts` files, or deciding where a screen's module sits relative to its route file.
metadata:
  author: oliverpan
  version: 2.0.0
---

# React composition structure

These rules say where React files live, how to name them, and how a screen
file reads. They complement Vercel's `composition-patterns` skill. That skill
explains component architecture. This one puts it into folders, files,
exports, and names.

Official framework docs and official framework skills own engineering
practice, such as rendering, caching, and data fetching. When they contradict
a rule here, follow them and tell the user what conflicted.

## Start here: find the router

Module shape is the same under every router. Module placement is not. Before
you create or move a route-bound module, find the nearest `package.json`
above the file you are editing and match its dependency and its files:

| Dependency and files | Read next |
| --- | --- |
| `expo-router`, and `app/_layout.tsx` | `../react-composition-structure-expo/SKILL.md` |
| `next`, and `app/**/page.tsx` | `../react-composition-structure-nextjs/SKILL.md` |
| `@tanstack/react-start` or `@tanstack/react-router`, and `routeTree.gen.ts` | `../react-composition-structure-tanstack-start/SKILL.md` |
| anything else | `rules/placement-separate-tree.md` |

If the skill in the table is not installed, stop and give the user this
command, with the skill's folder name in place of `<name>`:

```bash
npx skills add fluid-design-io/react-composition-structure --skill <name>
```

Before you create or move a file, state the placement and the evidence for
each package in one line.

Modules that the package already places consistently override the table. An
explicit placement request from the user overrides both. When a request names
a placement that differs from the detected one, such as "use the same
`screens/` setup in every app", tell the user in one line that it differs,
and say which placement you will use, before you write a file. Never
reinterpret the request in silence. `rules/placement-detect-router.md` has the
full procedure, including monorepos.

Work on shared components under `components/` needs no router. Skip this
section for it.

## Vocabulary

- **Root**: the component that wraps the provider and carries the module's
namespace
- **Leaf**: one named part that consumers compose, such as `Composer.Input`
- **Gate**: a leaf that reads module context and returns `null` unless its
state holds. Gates live in `<stem>.states.tsx`
- **Nested namespace**: a leaf with named parts, assembled with
`Object.assign` in the leaf's own file, such as `Activity.Header.Address`
- **Blueprint**: a screen file that contains one declarative tree of leaves
and gates, with design notes as doc comments on the subtree they explain
- **Subflow folder**: a nested folder that owns a flow and has its own
public API
- **Role folder**: a nested folder that holds peers of one kind, such as
`layout/`, with no `index.ts`

## Scaling ladder

Add structure when a trigger fires, not before.

1. **One file.** A small presentational component stays flat.
2. **Compound folder.** Several named leaves, or shared state. Read
`architecture-compound-component-folders`.
3. **Gates.** A second render state appears. Add `<stem>.states.tsx`. Read
`architecture-screen-blueprints`.
4. **Nested namespace.** A leaf grows named parts. Same rule as step 3.
5. **Subflow folder.** Three or more files share a prefix. Read
`organization-nest-when-prefix-repeats`.
6. **Role folder.** The flat listing passes about a dozen files and no prefix
repeats. Read `organization-group-by-role`.

## Rules

Read the one rule file that matches the job. Each is in `rules/`.

| Rule | Covers |
| --- | --- |
| `architecture-compound-component-folders` | One folder and one namespace for shared multi-part UI, with a `state`, `actions`, `meta` context contract |
| `architecture-route-bound-module-folders` | Module folders for pages and screens, thin route files, module-owned params, `<stem>.data.ts` |
| `architecture-screen-blueprints` | Screens as declarative trees, gates, design notes on the subtree |
| `placement-detect-router` | Deciding placement from workspace evidence |
| `placement-separate-tree` | The default placement, with a one-line route entry |
| `boundaries-public-api` | One exported root, and exports that a consumer proves |
| `naming-stems-and-suffixes` | One stem per folder and one suffix per job |
| `organization-nest-when-prefix-repeats` | When to nest a folder |
| `organization-group-by-role` | When to add role folders |
| `organization-colocate-internals` | When to lift helpers, data, and types |

`AGENTS.md` holds every rule in one document. The build generates it from
`rules/`. Never edit it by hand.
