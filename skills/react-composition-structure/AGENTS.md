# React Composition Structure

Engineering  
September 2026  
Version 2.0.0

> Note:
> This guide is written for agents and AI-assisted refactors. It covers
> folders, file ownership, export boundaries, naming, and how a screen file
> reads.

## Abstract

A React codebase gets hard to maintain when the UI uses composition patterns
and the file system does not show them. The symptoms are large single files,
modules that export everything, generic file names, and route files that own
domain orchestration.

This guide has five rule areas:

1. shared component folders
2. route-bound domain modules, screen blueprints, and module placement
3. public API boundaries
4. naming stems and suffixes
5. organization heuristics, which say when to nest, group, and lift

The rules share one vocabulary: root, leaf, gate, nested namespace,
blueprint, subflow folder, and role folder. Every rule applies to React DOM
and React Native.

Shape and placement are separate questions. Shape is the same under every
router, and most of this guide describes it. *Feature* means the domain module
being restructured (checkout, calendar, cart), not a `features/` directory.
Example trees have no parent directory, because they show shape only.

Placement is where a route-bound module sits relative to its route file. It
depends on the router. Rule 2.3 decides it from workspace evidence before you
create or move a module. Rule 2.4 is the default placement. The Next.js, Expo
Router, and TanStack Start placements each have their own skill.

## Table of Contents

1. [Component folders](#1-component-folders) (HIGH)
  - 1.1 [Use compound component folders for shared multi-part UI](#11-use-compound-component-folders-for-shared-multi-part-ui)
2. [Route-bound module folders](#2-route-bound-module-folders) (HIGH)
  - 2.1 [Use module folders for route-bound UI](#21-use-module-folders-for-route-bound-ui)
  - 2.2 [Compose screens as declarative blueprints](#22-compose-screens-as-declarative-blueprints)
  - 2.3 [Detect the router before placing a module](#23-detect-the-router-before-placing-a-module)
  - 2.4 [Default placement: a separate module tree](#24-default-placement-a-separate-module-tree)
3. [Public API boundaries](#3-public-api-boundaries) (MEDIUM)
  - 3.1 [Export one module root by default](#31-export-one-module-root-by-default)
4. [Naming stems and suffixes](#4-naming-stems-and-suffixes) (MEDIUM)
  - 4.1 [Keep one stem and use responsibility-driven suffixes](#41-keep-one-stem-and-use-responsibility-driven-suffixes)
5. [Organization heuristics](#5-organization-heuristics) (MEDIUM)
  - 5.1 [Nest folders when filename prefixes repeat](#51-nest-folders-when-filename-prefixes-repeat)
  - 5.2 [Group peer leaves into role folders when a flat module grows long](#52-group-peer-leaves-into-role-folders-when-a-flat-module-grows-long)
  - 5.3 [Colocate internals until a second consumer appears](#53-colocate-internals-until-a-second-consumer-appears)

## 1. Component folders

### 1.1 Use compound component folders for shared multi-part UI

Use a compound component folder when a shared component has:

- several named parts that consumers compose directly
- state that several sibling leaves read
- variants that would otherwise become boolean props

A small presentational component stays one flat file. Add the folder when the
component grows one of the traits above, not before.

**Bad: one large component plus sibling exports**

```text
Composer.tsx
ComposerHeader.tsx
ComposerFooter.tsx
ComposerInput.tsx
ComposerActions.tsx
useComposerState.ts
```

Problems:

- the public API is six unrelated file names
- shared state leaks through props or one-off hooks
- consumers must learn every implementation name

**Good: one folder with one public namespace**

```text
composer/
  composer.tsx             // assembles the namespace
  composer.context.tsx     // provider wiring
  composer.display.tsx     // read-oriented leaves
  composer.actions.tsx     // interactive leaves
  composer.types.ts        // the context contract
  index.ts                 // the public boundary
```

**Bad: a leaf coupled to one state hook**

```tsx
function ComposerInput() {
  const { input, setInput } = useChannelComposerState()
  return <Input value={input} onChange={setInput} />
}
```

The leaf now works with one state implementation only.

**Good: leaves read a stable context contract**

Use the `state`, `actions`, `meta` contract from Vercel's composition patterns
guide (https://github.com/vercel-labs/agent-skills, rule 2.2). Any provider
can implement it, so the same leaves work over local state, a store, or a
server-synced session.

```tsx
type ComposerContextValue = {
  state: { input: string; attachments: Attachment[] }
  actions: { updateInput: (value: string) => void; submit: () => void }
  meta: { inputRef: React.RefObject<HTMLInputElement | null> }
}

const ComposerContext = createContext<ComposerContextValue | null>(null)

function ComposerInput() {
  const { state, actions, meta } = use(ComposerContext)!

  return <Input ref={meta.inputRef} value={state.input} onChange={actions.updateInput} />
}
```

The contract lives in `composer.types.ts` and the provider in
`composer.context.tsx`. Leaves consume the contract and never own state.

**State sharing follows the provider, not the layout**

A component outside the visible frame can read and change the state when it
sits inside the provider:

```tsx
function ForwardMessageDialog() {
  return (
    <Composer.Provider value={value}>
      <Dialog>
        <Composer.Frame>
          <Composer.Input />
          <Composer.Submit />
        </Composer.Frame>
        <MessagePreview />
        <ForwardButton />
      </Dialog>
    </Composer.Provider>
  )
}
```

**A provider owns its orchestration or accepts it, never both**

A provider either starts its own query or session, or it accepts a running
controller as `value`, as the dialog above does. Accepting one lets a second
screen render the compound around a session that screen already owns. That
second screen must never start a duplicate session behind it. Give the
accepting mode its own named entry point. Do not hide the choice inside
leaves.

**Bad: a namespace that only aliases files**

```tsx
export const Requests = {
  List: RequestsList,
  Screen: RequestsScreen,
}
```

These parts share no state and no consumer composes them together. Callers
still learn two names, and every import of the list also loads the screen.
Export each part as a top-level symbol (see
`architecture-route-bound-module-folders.md`). Keep namespaces for parts that
compose.

**Gates and nested namespaces**

When the visibility of several leaves depends on module state, add
`<stem>.states.tsx` with gates. When one leaf grows named parts, assemble a
second-level namespace (`Composer.Header.Title`) in that leaf's file.
`architecture-screen-blueprints.md` covers both.

A module may own a shared namespace and route-bound screens when both belong
to one domain. The namespace holds leaves only. Screens are top-level exports.

**Checklist**

- Is the component shared or multi-part?
- Do several leaves read the same state?
- Does the folder expose one root namespace?
- Do leaves read the context contract instead of a specific hook?
- Does provider wiring sit apart from leaf rendering?

## 2. Route-bound module folders

### 2.1 Use module folders for route-bound UI

Give a page or screen a module folder when it has any of these:

- route UI plus several internal leaves
- its own query or mutation orchestration
- several related screens
- nested subflows

A small page stays one flat file. *Feature* in this guide means the domain
module being restructured (checkout, calendar, cart). It does not mean a
`features/` directory.

This rule covers the module's shape. Where the folder sits relative to the
route file depends on the router. Run `placement-detect-router.md` before you
create or move a module. The trees below have no parent directory on purpose.

**Bad: domain logic spread across global folders**

```text
checkout.tsx
useCheckout.ts
CheckoutList.tsx
CheckoutSummary.tsx
types.ts
helpers.ts
```

Problems:

- the module has no single home
- data logic drifts into generic hook folders
- the route file collects orchestration

**Good: one module folder**

```text
checkout/
  checkout.tsx             // namespace, when the module exposes 2+ leaves
  checkout.screen.tsx      // route-facing UI, a blueprint
  checkout.data.ts         // module-owned orchestration
  checkout.list.tsx        // leaf
  checkout.summary.tsx     // leaf
  checkout.types.ts
  index.ts                 // public boundary
```

A module that exposes screens and at most one leaf can skip `checkout.tsx`
and export from `index.ts` directly.

**Bad: the route file owns domain orchestration**

```tsx
export default function CheckoutRoute() {
  const { cart, isSubmitting, submitOrder } = useCheckout()

  return (
    <CheckoutLayout>
      <CheckoutList cart={cart} />
      <CheckoutSubmitButton loading={isSubmitting} onPress={submitOrder} />
    </CheckoutLayout>
  )
}
```

**Good: the route file is a thin entry**

The route file points at the module. Its body holds route-only concerns:
options the router reads from that file, route-group chrome, a platform
quirk. Knowledge about the URL itself goes in a doc comment in the route
file, for example why a catch-all segment exists. The placement rule for the
router says what else the route file may hold.

**Params belong to the module**

The module parses its own route params in its context or data file. When
parsing is more than a cast (amounts, composite ids), put the helpers in
`<stem>.params.ts`. A router that hands params to the route file passes them
to the module unparsed.

**Multi-screen modules**

When a module has two or more screens, export each screen as a top-level
symbol. The namespace holds shared leaves only, such as `Faculty.Avatar`.

```text
faculty/
  faculty.tsx                  // Faculty = { Avatar }
  faculty.directory.screen.tsx
  faculty.detail.screen.tsx
  faculty.avatar.tsx
  faculty.data.ts
  index.ts
```

```ts
export { Faculty } from "./faculty"
export { FacultyDirectoryScreen } from "./faculty.directory.screen"
export { FacultyDetailScreen } from "./faculty.detail.screen"
```

**What belongs in `<stem>.data.ts`**

- grouped view models
- queries and mutations only this module runs
- filter and search state
- adapters only this module uses

Generic API clients and hooks with several consumers live elsewhere. When a
subflow nests, data that only the subflow reads moves into the subflow's own
data file (see `organization-colocate-internals.md`).

**Nested subflows**

```text
profile/
  profile.tsx
  profile.screen.tsx
  profile.data.ts
  security/
    security.tsx
    security.screen.tsx
    security.data.ts
    index.ts
  index.ts
```

Nest a folder when it owns a flow. Do not nest for symmetry.

**Checklist**

- Is a flat route file still enough?
- Did `placement-detect-router.md` decide where the module sits?
- Does the route file hold only route concerns?
- Does the module parse its own params?
- Does module-owned orchestration live in `<stem>.data.ts`?
- Does each nested folder own a flow?

### 2.2 Compose screens as declarative blueprints

A blueprint is a screen file that contains one declarative tree of the
module's leaves. It has no branching, no data reads, and no layout logic. A
reviewer reads the blueprint to learn what the screen is made of and which
states it can be in, without opening a leaf.

A screen with one render state is already a blueprint if it follows that
rule. Gates are the layer you add when a second render state appears. A gate
is a leaf that reads the module context and returns `null` unless its state
holds. The parent never decides visibility.

**Bad: the screen owns the branching**

```tsx
export function ActivityScreen() {
  const { isOffline, isLoading, rows } = useActivityData()

  if (isOffline) return <OfflineState />

  return (
    <Screen>
      <ActivitySegments />
      {isLoading ? <Spinner /> : <ActivityList rows={rows} />}
    </Screen>
  )
}
```

Problems:

- every new state widens the conditional tree
- the screen reads data, so a reader needs the hook to understand it
- the states hide inside expressions, so nobody can list them
- the reason for each state has no place to live

**Good: the blueprint lists every state**

```tsx
/**
 * The member activity feed. Segments filter on the server. Each segment is
 * its own query, never a client-side filter over a fetched page.
 */
export function ActivityScreen() {
  return (
    <Activity>
      <Activity.Offline />
      <Activity.Ready>
        <Activity.Segments />
        <Activity.List />
      </Activity.Ready>
    </Activity>
  )
}
```

The gates live in `<stem>.states.tsx`:

```tsx
/** Full-page substitute when nothing is cached and the device is offline. */
export function ActivityOffline() {
  const { state } = useActivityContext()
  if (state.status !== "offline") return null

  return <OfflineState subject="Your activity" />
}

/** Everything the feed shows once the offline page does not own the screen. */
export function ActivityReady({ children }: PropsWithChildren) {
  const { state } = useActivityContext()
  if (state.status === "offline") return null

  return <>{children}</>
}
```

A gate owns one visibility rule. Sibling gates may exclude each other
(offline, ready) or stack (an error banner above a stale list).

**Bad: gates that take a props bag**

```tsx
export function PayLinkScreen() {
  const status = usePayLinkStatus(url)

  return (
    <Screen>
      <PayLinkOffline status={status} />
      <PayLinkLoading status={status} />
      <PayLinkReady status={status} data={status.data} onClaim={claim} />
    </Screen>
  )
}
```

The screen still reads data and still knows every gate's inputs. Adding a
state edits two files. Give the gates a provider and let each read context.

**Derive precedence once**

With three or more states, derive one discriminated status in the provider,
such as `"offline" | "loading" | "error" | "ready"`, and let each gate test
it. Gates that each rebuild precedence from query booleans drift apart.

**Notes sit on the subtree they explain**

A blueprint has no logic, so design intent goes in doc comments. A decision
about the whole screen goes on the screen. A rule about one leaf goes on that
leaf:

```tsx
/**
 * The address renders plain. Splitting it into a bright local part and a dim
 * domain helps lists that repeat one domain down every row. One address
 * stated once has nothing to de-duplicate.
 */
const ActivityHeaderAddress = () => {
  const { state } = useActivityContext()
  if (state.status !== "ready") return null

  return <Chrome.Subtitle>{state.record.address}</Chrome.Subtitle>
}
```

**A leaf with named parts becomes a nested namespace**

Assemble it in the leaf's own file. The file count does not change.

```tsx
// activity.header.tsx
export const ActivityHeader = Object.assign(ActivityHeaderRoot, {
  Address: ActivityHeaderAddress,
  Summary: ActivityHeaderSummary,
})
```

```tsx
<Activity.Header>
  <Activity.Header.Address />
  <Activity.Header.Summary />
</Activity.Header>
```

Move the leaf into its own folder only when the prefix trigger fires (see
`organization-nest-when-prefix-repeats.md`).

**Checklist**

- Can a reader list every state of the screen from the blueprint?
- Does each gate read context and decide its own visibility?
- Does the provider derive state precedence once?
- Is the screen file free of data reads, router reads, conditionals, and
layout logic?
- Do design notes sit on the subtree they explain?
- Are second-level parts nested namespaces in the leaf's file?

### 2.3 Detect the router before placing a module

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

### 2.4 Default placement: a separate module tree

Use this placement when `placement-detect-router.md` names it, or when a
framework skill sends you here. It works under every router, because it
assumes the worst case, a router that turns every file in its route directory
into a route.

The module lives outside the route directory, in the tree the repo already
uses for route-bound UI (`screens/`, `src/screens/`, `components/`). The
route entry points at it.

```text
<route directory>/
  checkout.tsx            // one-line route entry
screens/
  checkout/
    checkout.tsx
    checkout.screen.tsx
    checkout.states.tsx
    checkout.data.ts
    checkout.list.tsx
    index.ts
```

**The route entry is one line**

```tsx
export { CheckoutScreen as default } from "@/screens/checkout"
```

In a router that registers screens in code, the entry is a one-line screen
registration in a navigator.

Two trees give you three properties:

- moving a route into another group changes one file and never the module
- moving or renaming the module never changes a URL
- several route entries can name one screen, such as a modal and a push
presentation of it

**Bad: module files inside the route directory**

```text
<route directory>/
  checkout/
    index.tsx
    checkout.list.tsx       // the router may serve this as a URL
    checkout.data.ts
```

**Checklist**

- Does the route directory hold only route entries and layouts?
- Is each route entry one line, or does its body hold a route-only concern?
- Does the module import nothing from the route directory?

## 3. Public API boundaries

### 3.1 Export one module root by default

A module folder exports its root namespace and nothing else, unless another
export is a deliberate entry point. Callers then import one name, and the
files inside the folder can change without breaking them.

**Bad: export everything inside the folder**

```ts
export { CheckoutScreen } from "./checkout.screen"
export { CheckoutList } from "./checkout.list"
export { useCheckoutData } from "./checkout.data"
export { CheckoutSummary } from "./checkout.summary"
```

Callers now depend on the folder's layout, and every internal rename breaks
an import.

**Good: export the entry points**

```ts
export { Checkout } from "./checkout"
```

A module with two or more screens exports each screen beside the root (see
`architecture-route-bound-module-folders.md`):

```ts
export { Faculty } from "./faculty"
export { FacultyDirectoryScreen } from "./faculty.directory.screen"
export { FacultyDetailScreen } from "./faculty.detail.screen"
```

**A consumer proves each export**

When you restructure an existing barrel, search for each exported symbol
outside the module. Delete the exports nobody imports. Do not carry them into
the new `index.ts`.

**Exceptions**

Export another symbol only when it is part of the contract:

- a documented type for external consumers
- a route helper that code outside the module calls
- a test utility in a separate testing entry point

Write the reason next to the export.

**Checklist**

- Does `index.ts` export only entry points?
- Do callers import the namespace and not internal leaves?
- Did a consumer search prove every export you kept?
- Does each exception have a written reason?

## 4. Naming stems and suffixes

### 4.1 Keep one stem and use responsibility-driven suffixes

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

## 5. Organization heuristics

These rules add no new structures. Each one names a trigger that tells you when to nest a flat folder, when to group peers, and when to lift colocated code.

### 5.1 Nest folders when filename prefixes repeat

**Trigger:** three or more sibling files share a leading stem, such as
`calendar.detail.*`. Move them into a folder named for that stem.

Files inside the new folder keep a short stem (`detail/detail.header.tsx`,
not `detail/header.tsx`), so a search for `detail.header` still finds the
file.

**Bad: a flat folder with a repeated prefix**

```text
calendar.detail.header.tsx
calendar.detail.list.tsx
calendar.detail.footer.tsx
calendar.detail.utils.ts
calendar.detail.data.ts
calendar.detail.types.ts
calendar.list.tsx
calendar.data.ts
calendar.types.ts
```

Problems:

- `detail` repeats in six names and separates nothing
- `calendar.detail.*` and `calendar.*` interleave when sorted
- every file looks importable, because no file marks a boundary
- nobody can move or delete the detail flow as a unit

**Good: the folder carries the prefix**

```text
calendar/
  detail/
    detail.header.tsx
    detail.list.tsx
    detail.footer.tsx
    detail.utils.ts
    detail.data.ts
    detail.types.ts
    index.ts
  calendar.list.tsx
  calendar.data.ts
  calendar.types.ts
  index.ts
```

**When the subfolder gets an `index.ts`**

A subfolder gets its own `index.ts` only when it is a subflow that its parent
consumes as a unit, as `detail/` is here. Otherwise files import each other
directly (`./detail.header`) and the module's root `index.ts` stays the only
public boundary (see `boundaries-public-api.md`).

**When not to nest**

- the folder would hold one or two files
- the prefix appears twice and shows no sign of growing
- the only gain is symmetry

Count the folder your change produces, not the folder you start with. Two
files that the same change grows into a provider, gates, and a screen already
meet the trigger. Tests move with their files into the folder's `__test__/`
and do not count. Inside a module that is already past the role-folder
trigger, two files that own a distinct flow may still nest. Write that reason
in the commit.

When no prefix repeats but the flat listing is long, group by role instead
(see `organization-group-by-role.md`).

**Checklist**

- Do three or more sibling files share a leading stem?
- Does the new folder keep the short stem on its files?
- Does the folder have an `index.ts` only if its parent consumes it as a
unit?

### 5.2 Group peer leaves into role folders when a flat module grows long

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

### 5.3 Colocate internals until a second consumer appears

Helpers, data, and types live next to the component that uses them. Tests
live in a `__test__/` folder inside the same module.

**Trigger:** a second consumer imports the helper. Until then, keep it where
it is.

**Bad: lifted before a second consumer exists**

```text
lib/
  format-date.ts            // only calendar/detail imports this
  detail-utils.ts           // only calendar/detail imports this
calendar/
  detail/
    detail.header.tsx       // imports ../../lib/format-date
```

`lib/` now claims reuse that does not exist. A change to `detail` edits an
unrelated directory, and a later reader cannot tell shared code from code
lifted too early.

**Good: colocated**

```text
calendar/
  detail/
    detail.header.tsx
    detail.utils.ts         // format-date lives here
    detail.data.ts
    __test__/
      detail.header.test.tsx
    index.ts
```

**Where code goes as consumers appear**

- one consumer: next to it
- two consumers in one module tree: the nearest common parent folder
- consumers in unrelated modules: `lib/` or `shared/`
- data only a subflow reads: the subflow's own `<stem>.data.ts`
- data the root module and a subflow both read: the module-level
`<stem>.data.ts`
- types used inside one folder: that folder's `<stem>.types.ts`
- types that cross a folder boundary: exported through `index.ts`

You can move or delete a module that owns all its internals as one folder.

**Checklist**

- Does a second consumer exist before you lift a helper?
- Do helpers, data, types, and tests sit with their consumer?
- Did lifted code go to the nearest common parent?
- Does `lib/` hold only code that two or more modules import?
