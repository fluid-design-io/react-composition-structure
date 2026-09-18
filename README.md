# React composition structure

Agent skills that say where React files live, how to name them, and how a
screen file reads. One shared skill covers every React and React Native
codebase. Three framework skills add the placement rules for Next.js, Expo
Router, and TanStack Start.

These skills cover how code looks and where it sits. Official framework docs
and official framework skills own rendering, caching, and data fetching, and
they win any conflict.

## Install

Install the shared skill and the skill for your framework:

```bash
npx skills add fluid-design-io/react-composition-structure --skill react-composition-structure react-composition-structure-nextjs
```

| Your app | Skills |
| --- | --- |
| Next.js App Router | `react-composition-structure` `react-composition-structure-nextjs` |
| Expo Router | `react-composition-structure` `react-composition-structure-expo` |
| TanStack Start | `react-composition-structure` `react-composition-structure-tanstack-start` |
| React Navigation, Next.js Pages Router, React Router, no router | `react-composition-structure` |
| A monorepo with several of these | the shared skill plus each framework skill |

A framework skill needs the shared skill. If the shared skill is missing, the
framework skill tells the agent to stop and print the install command.

### Upgrading from 1.x

`npx skills update` brings the shared skill to 2.0.0. Then add your framework
skill with the command above. Version 1.x told every router to re-export
screens from a separate `screens/` tree. Version 2.0.0 keeps that as the
default and gives Next.js and TanStack Start their own placements.

## How an agent uses them

The shared `SKILL.md` opens with a router table. The agent finds the nearest
`package.json`, matches a dependency and a file, and reads the framework skill
the table names. Each framework `SKILL.md` checks the same evidence before it
applies. A monorepo with a mobile app and a web app gets a separate answer
for each package.

## Repository layout

```text
skills/
  react-composition-structure/                  shared rules, router table
  react-composition-structure-nextjs/           5 rules
  react-composition-structure-expo/             1 rule
  react-composition-structure-tanstack-start/   1 rule
templates/<skill>.head.md    intro for each generated AGENTS.md
metadata.json                version, date, skill titles
scripts/build-agents.mjs     generates AGENTS.md and lints the skills
scripts/verify-fixtures.mjs  builds the fixtures and checks the rules' claims
fixtures/next/               a Next.js app that uses every Next.js rule
fixtures/tanstack/           a TanStack Start app that uses the TanStack rule
```

Each skill folder holds `SKILL.md`, `rules/`, and a generated `AGENTS.md`.
`npx skills add` installs the whole folder. Templates, scripts, and fixtures
stay in this repo.

## Commands

```bash
npm run build
```

Generates each skill's `AGENTS.md` from its `rules/`. The build fails when a
skill contains a term that belongs to another framework, such as
`createFileRoute` in the Next.js skill. It also fails on an em dash, an en
dash, or an arrow character.

```bash
npm run verify
```

Installs and builds both fixtures, then checks 22 claims. Examples are that
colocated files add no Next.js routes, that a re-exported `generateMetadata`
sets the title, and that the TanStack generator turns an empty stem-dotted
file into a live route. Run it when a framework ships a major version.

## Principles

1. Folders show the composition. A compound component gets one folder and one
  namespace.
2. A module exports one root. A consumer proves every other export.
3. Orchestration lives with its module, in `<stem>.data.ts`.
4. A file name states the owner and the job.
5. Structure follows a trigger. Nest, group, and lift when the trigger fires.
6. Shape is the same under every router. Workspace evidence decides
  placement, one package at a time.
7. A coherent existing convention stays.

## Adding a rule

1. Create `skills/<skill>/rules/<prefix>-<name>.md` with the frontmatter the
  other rules use (`title`, `slug`, `group`, `groupNumber`, `section`,
  `impact`, `tags`).
2. Write the rule, short Bad and Good examples in an abstract domain, and a
  checklist. Framework rules end with **Official docs**.
3. Add the rule to that skill's `SKILL.md` table.
4. Run `npm run build`. If the rule makes a claim about framework behavior,
  add it to a fixture and to `scripts/verify-fixtures.mjs`.

Rule file prefixes:

- `architecture-` for folder shape and module organization
- `boundaries-` for exports
- `naming-` for stems and suffixes
- `organization-` for the nest, group, and lift triggers
- `placement-` for where a module sits, in the shared skill
- `nextjs-`, `expo-`, `tanstack-` for framework rules

Shared rules never name a framework. Example trees in shared rules have no
parent directory. `placement-detect-router.md` is the one exception, and its
frontmatter says so with `lint: framework-names-allowed`.

## Impact levels

- `HIGH`: structure that prevents churn and unclear ownership
- `MEDIUM`: structure that improves maintainability and consistency

## Prose style

Every file follows the `unslop` rules: no em dashes, no colon used as a
connector, sentence-case headings, active voice, whole sentences, and plain
words.
