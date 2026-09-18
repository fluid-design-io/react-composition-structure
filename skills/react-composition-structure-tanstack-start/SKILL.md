---
name: react-composition-structure-tanstack-start
description: File structure for TanStack Start and file-based TanStack Router apps. Use when adding or restructuring a route under `src/routes/`, deciding what a `createFileRoute` file contains, placing loaders and `createServerFn` wrappers, colocating components beside a route, or reading params from a component with `getRouteApi`.
metadata:
  author: oliverpan
  version: 2.0.0
---

# React composition structure for TanStack Start

## Stop if the shared skill is missing

Check that `../react-composition-structure/SKILL.md` exists before anything
else. If it does not exist, do not create or edit any file, and do not
continue with the rules below. Reply with the reason and this command, then
wait for the user:

```bash
npx skills add fluid-design-io/react-composition-structure --skill react-composition-structure
```

The rules below use the shared skill's vocabulary (root, leaf, gate,
blueprint, stem) and its naming and folder rules. Work done without them
needs redoing.

## Check that this skill applies

It applies when the nearest `package.json` lists `@tanstack/react-start` or `@tanstack/react-router`, and the package has `routeTree.gen.ts` and `createFileRoute(` calls under `src/routes/`. If the evidence does not match, go back to the router table in the
shared skill.

Then read `../react-composition-structure/SKILL.md`, if you have not read it
in this session.

## What this skill covers

One rule, `rules/tanstack-module-beside-route.md`. It says where a route's
module lives, what the route file contains, and where loader and server
function code goes. The official TanStack docs own routing, loading, and
server function behavior, and they win any conflict. Tell the user what
conflicted.

Verified against `@tanstack/react-start` 1.168 and `@tanstack/react-router`
1.170. `fixtures/tanstack/` in the source repo builds every claim in the rule.
