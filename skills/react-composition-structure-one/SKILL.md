---
name: react-composition-structure-one
description: Blueprint topology and module placement for One framework (onestack.dev) apps. Use whenever a package imports `one` or configures `one/vite` and the work adds or restructures a screen, layout or route file, moves code out of the route directory, connects a `loader` or `useLoader` to a screen's provider, adds `+ssr`, `+spa` or `+api` routes, or composes React Native with One's SwiftUI, Compose and imported native views. Use it even when the user only says "add a page" or "clean up this screen" in a One app.
metadata:
  author: oliverpan
  version: 2.1.0
---

# React composition structure for One

## Read the shared skill

Read `../react-composition-structure/SKILL.md` first. It owns stems, compound
namespaces, state gates, public exports and the triggers for adding folders.
If it is missing, explain the dependency and provide the install command.
Do not silently invent a replacement convention.

```sh
bunx skills add fluid-design-io/react-composition-structure --skill react-composition-structure react-composition-structure-one
```

## Check that this skill applies

Use the nearest owning package. Require a `one` dependency, a Vite config
using `one` from `one/vite`, and its configured file-system route directory.
The route root is `app/` unless the `one()` options set `router.root`, such
as `router: { root: "src/app" }`. One's types label that option dangerous,
so never introduce a custom root yourself. A sibling package's dependencies
prove nothing.

For an explicitly requested new One app, apply this convention while
planning its files. Do not scaffold an app just to establish detection.

This subset adds personal composition rules. It does not require a particular
component library, data cache, bundler or backend.

## Read and verify the official guidance

Locate the installed official `building-with-one` and `one-guides` skills
in the project or agent skill directories. Read their entrypoints, then only
the references relevant to the task. Read the matching official One skill
when working on loaders, endpoints or render modes. If it is missing, use
official docs and report the missing resource. Installation requires task
authorization.

Official skills are an index, not proof that a snippet matches the installed
release. Check the installed `one` version in the package manifest. When an
API shape matters and you are unsure, read its declaration under
`node_modules/one/types`, which is faster and more exact than prose docs.
Tell the user about a conflict that changed your choice. Do not audit
every import of a routine edit.

One's runtime and compiler contracts govern rendering, navigation, loaders,
native interoperability and configuration. These personal rules govern
placement and visible composition. Adapt an adapter or native boundary when
needed to satisfy both. Resolve routine API questions through authoritative
sources. Ask about genuinely unresolved product or topology choices.

## The topology to preserve

- Route files expose the framework contract and connect it to a module.
- `<stem>.screen.tsx` shows the complete declarative screen composition.
- A layout blueprint shows providers, navigation, slots and shared chrome.
- Namespace roots provide state or layout without hiding the whole screen.
- `<stem>.states.tsx` gates decide domain visibility from module context.
- `<stem>.data.ts` owns orchestration; the provider exposes its contract.
- Platform leaves implement native controls inside the visible topology.

A route adapter may bind a framework hook to its own route export. This
does not move domain orchestration into the route or make the screen read
router state. Preserve actual boundaries during a file-only refactor. Add
no loader, provider, gate or suspense boundary for symmetry.

## Rules

Read the rule matching the work. Read the blueprint rule for screens and
layouts, and the native rule when a native host enters the tree.

| Rule | Covers |
| --- | --- |
| 1.1 `one-route-adapters` | Route-root detection, modules, route exports and generated files |
| 1.2 `one-blueprint-topology` | Screen and layout trees, gates and boundaries |
| 1.3 `one-data-boundaries` | Loader adapters, module state, server imports and public exports |
| 1.4 `one-native-composition` | Host bounds, native child trees and source ownership |

`AGENTS.md` is generated from `rules/`. Never edit it by hand.

## Verification scope

The source repository's `fixtures/one` exercises web route adapters,
separate modules, a loader-to-provider boundary, a module-owned refresh
action and server-code exclusion.
Run `bun run verify:one` there after changing those claims. It does not prove
native layout or runtime behavior.

For native work, verify the selected pipeline and target device. A bundle
does not establish keyboard, safe-area, appearance, navigation or callback
behavior. Prove the affected interaction and label the evidence accurately.

## Sources

- [Official One skills](https://github.com/onejs/skills)
- [Routing](https://onestack.dev/docs/routing)
- [Loaders](https://onestack.dev/docs/routing-loader)
- [Configuration](https://onestack.dev/docs/configuration)
- [Native platform notes](https://onestack.dev/docs/native-platforms)
- [Native source](https://onestack.dev/docs/native-source)

The initial examples were checked against One 2.11.5 in October 2026.
Recheck the relevant contract when the project's version changes. This is
an evidence baseline, not a dependency pin for future applications.
