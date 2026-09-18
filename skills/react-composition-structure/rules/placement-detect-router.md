---
title: Detect the router before placing a module
slug: placement-detect-router
group: Route-bound module folders
groupNumber: 2
section: "2.3"
impact: HIGH
tags: placement, router-detection, monorepo
lint: framework-names-allowed
---

## Detect the router before placing a module

Module shape is the same under every router. Module placement is not. Where
the folder sits, and what the route file holds, depends on which files the
router turns into routes. Decide placement from evidence in the workspace.
Do not decide it from another project, from the examples in this guide, or
from the words in the request. "Screen" does not mean Expo and "page" does not
mean Next.js.

**Step 1. Find the owning package**

Walk up from the file you are editing to the nearest `package.json`. That
package decides, not the repo root. In a monorepo with a mobile app and a web
app, each app has its own placement.

**Step 2. Match the evidence**

Require the dependency and the files. A dependency alone proves nothing. A
monorepo package can list `next` without owning any routes.

| Dependency | Files | Read next |
| --- | --- | --- |
| `expo-router` | `app/_layout.tsx` or `src/app/_layout.tsx` | `../react-composition-structure-expo/SKILL.md` |
| `next` | `app/**/page.tsx` or `src/app/**/page.tsx` | `../react-composition-structure-nextjs/SKILL.md` |
| `@tanstack/react-start` or `@tanstack/react-router` | `routeTree.gen.ts`, and `createFileRoute(` under `src/routes/` | `../react-composition-structure-tanstack-start/SKILL.md` |
| anything else | any | `placement-separate-tree.md` |

"Anything else" includes React Navigation, React Router, the Next.js Pages
Router, TanStack routes defined in code, and apps with no router. A Next.js
package with both `app/` and `pages/` is mid-migration. Place by the
directory that holds the route you are editing.

If the table names a skill that is not installed, stop. Tell the user to run
this command, with the skill's folder name in place of `<name>`:

```bash
npx skills add fluid-design-io/react-composition-structure --skill <name>
```

**Step 3. Existing convention beats the table**

Look at where the package's route-bound modules already sit. If a clear
majority agree, follow them, even when the table says otherwise. The table is
for new projects, for packages with no pattern, and for migrations the user
asks for. If the package is mixed, follow the table for new work and tell the
user about the inconsistency in one line. Never move existing modules as a
side effect of other work.

An explicit placement request beats both. "Add an orders screen" names no
placement. "Put it in `src/screens/` like the mobile app" does. The separate
tree works under every router, so follow that request, and first tell the
user in one line that it differs from the package's detected placement.
Other placements do not work under every router. If a request names one the
router cannot support, say why and do not follow it.

**Step 4. State the result**

Before you create or move files, say which placement you detected and the
evidence, in one line. Then read only the rule or skill the table named.

**Bad: placement chosen by analogy**

```text
apps/web/                      // next, with src/app/**/page.tsx
  src/app/checkout/page.tsx
  src/screens/checkout/        // created because the mobile app has one
```

The sibling app's tree leaked into a package whose other modules all sit in
their route segments.

**Checklist**

- Did the nearest `package.json` and its files decide the placement?
- Do the package's existing modules agree with it?
- Did you read one placement rule or skill, and no other?
- Did existing modules stay where they were?
