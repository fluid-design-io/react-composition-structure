# React Composition Structure

A structured repository for React and React Native file-system composition
patterns that scale. These patterns help teams express good component
architecture in folders, files, naming, and export boundaries instead of
letting structure drift into monolithic files or bag-of-exports modules.

## Install

```bash
npx skills add fluid-design-io/react-composition-structure
```

## Structure

Shippable skill files live in `skills/react-composition-structure/` so that
`npx skills add` vendors the whole self-contained folder rather than just the
single `SKILL.md`:

- `skills/react-composition-structure/SKILL.md`: trigger metadata, the
primitives vocabulary, the scaling ladder, and the rule index
- `skills/react-composition-structure/rules/`: one file per rule
- `skills/react-composition-structure/AGENTS.md`: full compiled guide for
agents (generated; do not edit by hand)

The rule index lives in `SKILL.md` and nowhere else, so this README cannot
drift out of date with it.

Build tooling stays at the repo root and is not vendored:

- `templates/agents.head.md`: static intro (Note + Abstract) for the compiled
guide
- `metadata.json`: organization/date/abstract consumed by the generator
- `scripts/build-agents.mjs`: generates the skill's `AGENTS.md` from the
sources above

## Core principles

1. **Structure should reflect composition.** If the UI is compound, the folder
  should make that obvious
2. **One module, one public root.** Export the namespace, not every internal
  leaf
3. **Colocate module-owned orchestration.** Keep screen and page-specific
  `*.data.ts` close to the module they serve
4. **Name by ownership and responsibility.** Reuse one stem and make file jobs
  obvious from their suffixes
5. **Structure is a response to growth.** Nest, group, and lift when a trigger
  fires, not for symmetry
6. **Preserve coherent repo conventions.** Adapt the structure to the codebase
  instead of forcing a second naming system

## Creating a new rule

1. Create a new file in `skills/react-composition-structure/rules/` using the
  appropriate prefix
2. Add frontmatter (`title`, `slug`, `group`, `groupNumber`, `section`,
  `impact`, optional `groupIntro`) so the generator can place and order it
3. Use one main concern per rule file
4. Include:
  - a short explanation of why the rule matters
  - bad and good examples
  - file trees or code snippets when helpful
  - practical exceptions or a checklist if the rule needs guardrails
5. Add the rule to `skills/react-composition-structure/SKILL.md` so the quick
  reference stays current
6. Run `npm run build` to regenerate
  `skills/react-composition-structure/AGENTS.md` from `rules/`

## Prefix guide

- `architecture-` for folder shape and module organization
- `boundaries-` for public API and export rules
- `naming-` for file stems, suffixes, and naming consistency
- `organization-` for when-to-nest, when-to-group, and when-to-lift triggers

## Impact levels

- `HIGH`: foundational structure patterns that prevent churn and unclear
ownership
- `MEDIUM`: patterns that improve maintainability, discoverability, and
consistency
