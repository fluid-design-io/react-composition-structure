# React Composition Structure

Engineering  
August 2026

> Note:
> This guide is optimized for agents and AI-assisted refactors. It focuses on
> codebase shape: folders, file ownership, export boundaries, naming, and how
> composition patterns map onto those structures.

## Abstract

React and React Native codebases become hard to maintain when composition
patterns are present in the UI layer but not reflected in the file system.
Monolithic files, bag-of-exports modules, generic names, and route wrappers that
own domain orchestration all increase churn.

This guide defines five distinct rule areas:

1. shared component folders
2. route-bound domain modules and screen blueprints
3. public API boundaries
4. naming stems and suffixes
5. organization heuristics (when to nest, group, and lift)

The rules share a platform-neutral vocabulary: root, leaf, gate, nested
namespace, blueprint, subflow folder, role folder. Every pattern applies to
React DOM and React Native alike. Examples pick whichever platform reads
clearest and translate 1:1.

Folder location (`components/`, `screens/`, or any repo-specific tree) is
orthogonal to these rules. In this guide, *feature* names the domain module
being refactored (checkout, calendar, cart), not a literal `features/`
directory. A module under `components/` can own route-bound screens; a module
under `screens/` can expose a shared compound namespace. The rules describe
module shape, not where the repo places its top-level folders.

## Table of Contents

1. [Component folders](#1-component-folders) (HIGH)
  - 1.1 [Use compound component folders for shared multi-part UI](#11-use-compound-component-folders-for-shared-multi-part-ui)
2. [Route-bound module folders](#2-route-bound-module-folders) (HIGH)
  - 2.1 [Use module folders for route-bound UI](#21-use-module-folders-for-route-bound-ui)
  - 2.2 [Compose screens as declarative blueprints](#22-compose-screens-as-declarative-blueprints)
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

- multiple named subparts consumers compose directly
- shared state needed by several sibling leaves
- variants that would otherwise turn into boolean props

Keep leaf components flat when they are small and presentational. Foldering is a
response to real complexity, not a default ceremony.

**Bad: one monolithic component plus sibling exports**

```text
components/
  Composer.tsx
  ComposerHeader.tsx
  ComposerFooter.tsx
  ComposerInput.tsx
  ComposerActions.tsx
  useComposerState.ts
```

Problems:

- the public API is a bag of related files
- shared state tends to leak through props or ad hoc hooks
- consumers must know too many implementation names

**Good: one folder with one public namespace**

```text
composer/
  composer.tsx
  composer.context.tsx
  composer.display.tsx
  composer.actions.tsx
  composer.types.ts
  index.ts
```

The folder mirrors the composition model:

- `composer.tsx` assembles the namespace
- `composer.context.tsx` owns state-sharing boundaries
- `composer.display.tsx` owns read-oriented leaves
- `composer.actions.tsx` owns interactive leaves
- `composer.types.ts` owns the context contract
- `index.ts` owns the public boundary

**Bad: UI coupled to one specific state hook**

```tsx
function ComposerInput() {
  const { input, setInput } = useChannelComposerState()
  return <TextInput value={input} onChangeText={setInput} />
}
```

This traps the UI inside one implementation.

**Good: provider-led state sharing through a stable contract**

```tsx
type ComposerState = {
  input: string
  attachments: Attachment[]
}

type ComposerActions = {
  updateInput: (value: string) => void
  submit: () => void
}

type ComposerMeta = {
  inputRef: React.RefObject<TextInput>
}

type ComposerContextValue = {
  state: ComposerState
  actions: ComposerActions
  meta: ComposerMeta
}
```

```tsx
const ComposerContext = createContext<ComposerContextValue | null>(null)

function ComposerProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: ComposerContextValue
}) {
  return <ComposerContext value={value}>{children}</ComposerContext>
}

function ComposerInput() {
  const {
    state,
    actions: { updateInput },
    meta: { inputRef },
  } = use(ComposerContext)

  return (
    <TextInput
      ref={inputRef}
      value={state.input}
      onChangeText={updateInput}
    />
  )
}
```

This is the important file-system implication:

- put the context contract in `composer.types.ts`
- put provider wiring in `composer.context.tsx`
- let display and action leaves consume the interface rather than own state

**Sharing state outside the visible frame**

State sharing is a provider concern, not a visual nesting concern.
Components outside the main frame can still read or mutate state if they live
inside the provider boundary.

```tsx
function ForwardMessageDialog() {
  return (
    <Composer.Provider value={value}>
      <Dialog>
        <Composer.Frame>
          <Composer.Input />
          <Composer.Footer>
            <Composer.Submit />
          </Composer.Footer>
        </Composer.Frame>

        <MessagePreview />
        <DialogActions>
          <ForwardButton />
        </DialogActions>
      </Dialog>
    </Composer.Provider>
  )
}
```

This is why context ownership belongs in the component-folder rule: it defines
how shared UI folders map composition and state sharing into files.

**Own the orchestration or accept it, never both**

A provider either owns its query/session orchestration or accepts an
already-running controller as its `value` — the dialog above injects one. The
injected mode is what lets a second surface render the compound around a
session it already owns; the embedded presentation must never start a
duplicate session or query behind it. Keep that entry point intentional and
named, not a fork hidden inside leaves.

**Bad: a namespace bag that only aliases files**

```tsx
export const Requests = {
  List: RequestsList,
  Screen: RequestsScreen,
}
```

If the parts share no state and no consumer composes them together, the
object is a bag of exports wearing a namespace: callers still learn two
implementation names, and the bag drags the screen into every import of the
list. Export each part as a top-level symbol instead (see
`architecture-route-bound-module-folders.md`) and reserve the namespace for
parts that actually compose.

**Gates and nested namespaces**

When several leaves' visibility depends on module state, add a
`<stem>.states.tsx` of gates: leaves that read the context and return `null`
unless their state holds. Consumers then compose states declaratively instead
of branching. When one leaf grows named subparts, assemble a second-level
namespace (`Composer.Header.Title`) with `Object.assign` in the leaf's own
file. Both patterns are detailed in `architecture-screen-blueprints.md`.

A module may own both a shared compound namespace and route-bound screens
when the shared component genuinely belongs to the same domain. Keep the
compound namespace narrow (leaves only, no screens) and expose screens as
top-level exports per `architecture-route-bound-module-folders.md`.

**Checklist**

- Is the component truly shared or multi-part?
- Are several leaves reading the same state?
- Would booleans or render props otherwise proliferate?
- Does the folder expose one root namespace?
- Is provider wiring isolated from leaf rendering?

## 2. Route-bound module folders

### 2.1 Use module folders for route-bound UI

Use a module folder when a page or screen owns real local complexity. *Feature*
here means the domain module you are restructuring, not a required `features/`
parent directory. Place the folder wherever the repo already groups route-bound
UI (`screens/`, `components/`, etc.).

Signs the module has grown enough:

- route UI plus several internal leaves
- domain-specific query or mutation orchestration
- multiple related screens
- nested subflows within one module

Do not force small pages or screens into folders.

**Bad: domain logic scattered across unrelated globals**

```text
checkout.tsx
useCheckout.ts
CheckoutList.tsx
CheckoutSummary.tsx
types.ts
helpers.ts
```

Problems:

- the module has no obvious home
- data logic drifts into generic hook folders
- route wrappers tend to accumulate orchestration

**Good: one colocated module folder with thin route wiring**

```text
checkout/
  checkout.tsx
  checkout.screen.tsx
  checkout.data.ts
  checkout.list.tsx
  checkout.summary.tsx
  checkout.types.ts
  index.ts
```

File ownership:

- `<feature>.tsx` assembles the public namespace when the module exposes a
compound namespace (2+ leaves, or 1 leaf plus shared state). A module that
only exposes screens and a single leaf can skip `<feature>.tsx` and export
directly from `index.ts`.
- `checkout.screen.tsx` owns the main route-facing UI, kept as a
declarative blueprint once render states multiply (see
`architecture-screen-blueprints.md`)
- `checkout.data.ts` owns module-local orchestration
- leaf files such as `checkout.list.tsx` and `checkout.summary.tsx` own
presentational sections
- `index.ts` owns the public boundary (module root by default; top-level
screen exports when a module has two or more screens, see
**Multi-screen modules**)

**Bad: route file owns domain orchestration**

```tsx
export default function CheckoutRoute() {
  const { cart, isSubmitting, submitOrder } = useCheckout()

  return (
    <CheckoutLayout>
      <CheckoutList cart={cart} />
      <CheckoutSubmitButton
        loading={isSubmitting}
        onPress={submitOrder}
      />
    </CheckoutLayout>
  )
}
```

**Good: the route file is a one-line re-export**

```tsx
export { CheckoutScreen as default } from "@/screens/checkout"
```

In a file-based router (Expo Router, Next.js), the route file is a manifest
entry: a pointer into the module, not a home for code. The screen stays in
the module so the module stays movable, and so several route files can name
the same screen (a catch-all plus its bare segment, a modal and a push
presentation). A registration-based router (React Navigation stacks) makes
the same shape a one-line screen registration in a navigator.

**Params belong to the module**

The module reads and parses its own route params inside its context or data
file; that is what keeps the route file at one line. When parsing is
nontrivial (amounts, composite ids), colocate the parse helpers in a
`*.params.ts`.

A route file earns a body only for route-only concerns: static options the
router reads at build time, route-group chrome, a platform quirk. Route-only
knowledge (why this URL exists at all, such as a catch-all segment that
cannot match the bare path) lives as a doc comment in the route file. It is
routing knowledge, not screen knowledge, and it has nowhere else to go.

**Multi-screen modules**

When a domain module has two or more screens, export each screen as a
top-level symbol from `index.ts` instead of namespacing them under the module
root. Keep the module namespace reserved for shared compound leaves such as
`Faculty.Avatar`. A module with exactly one screen may still use
`Feature.Screen` for symmetry.

```text
faculty/
  faculty.tsx                // Faculty = { Avatar }
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

The set of exports should map to the set of intentional public entry points.
One root is the default, not a hard cap.

**What belongs in `*.data.ts`**

Put module-owned orchestration there:

- grouped view models
- screen-local queries and mutations
- filtering and search state
- adapters only this module uses

Do not put generic API clients or widely shared hooks there.

When a subflow nests (see `organization-nest-when-prefix-repeats.md`),
subflow-only data moves into the subflow's `*.data.ts`; see
`organization-colocate-internals.md`.

**Nested subflows**

When one domain module contains distinct subflows, use nested folders only if
they represent real ownership.

```text
profile/
  profile.tsx
  profile.screen.tsx
  profile.data.ts
  security/
    profile-security.tsx
    profile-security.screen.tsx
    profile-security.data.ts
    index.ts
  preferences/
    profile-preferences.tsx
    profile-preferences.form.tsx
    index.ts
  index.ts
```

Create nested folders for real subflows, not symmetry.

**Checklist**

- Is a flat route file still enough?
- Does the module have one obvious home?
- Is the route file a one-line re-export, or does its body own a route-only
concern?
- Does the module read and parse its own params?
- Is module-owned orchestration colocated in `*.data.ts`?
- Do nested folders represent real subflows?

### 2.2 Compose screens as declarative blueprints

When a screen has several render states (loading, offline, error, empty,
ready), keep the screen file a **blueprint**: a declarative tree of the
module's compound leaves, with no branching, no data reads, and no layout
logic. Each state becomes a **gate**, a leaf that reads the module context and
returns `null` unless its state holds. The parent never decides visibility;
each subtree decides for itself.

Gates and blueprints are pure React. Nothing here touches a platform API, so
the pattern is identical in React DOM and React Native.

The route file above a blueprint stays a one-line re-export. The module, not
the router tree, is the blueprint's home (see
`architecture-route-bound-module-folders.md`).

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
- the screen reads data, so nobody can understand it without the hook
- render states hide inside expressions instead of being enumerable
- the reasoning behind each state has nowhere to live but commit messages

**Good: the screen is a blueprint of every state**

```tsx
/**
 * The member activity feed. Segments filter on the server: each segment is
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

Reading the blueprint enumerates what the screen can be. The gates live in the
module's `<stem>.states.tsx`:

```tsx
/** Full-page substitute when nothing is cached and the device is offline. */
export function ActivityOffline() {
  const { state } = useActivityContext()
  if (!state.isColdOffline) return null

  return <OfflineState subject="Your activity" />
}

/** Everything the feed shows once the offline page does not own the screen. */
export function ActivityReady({ children }: PropsWithChildren) {
  const { state } = useActivityContext()
  if (state.isColdOffline) return null

  return <>{children}</>
}
```

A gate owns one visibility rule and states it once. Sibling gates may be
exclusive (offline vs. ready) or stacked (an error banner above a stale list).
Either way the blueprint shows the full set without a single conditional.

**Bad: gates in name, props in practice**

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

Handing every gate the same state bag keeps the orchestration in the screen
in disguise: the file still reads data, still knows every gate's inputs, and
adding a state edits two files. Give the gates a provider and let each read
the module context; the blueprint goes back to naming states only.

**Decide precedence once**

With three or more states, do not let each gate re-derive precedence from
query booleans (`isOffline && !isPending && …` restated per gate). Derive one
discriminated status in the provider — `'offline' | 'loading' | 'error' |
'ready'` — and let each gate test it. Precedence then lives in one derivation
instead of being reconstructed, slightly differently, in every gate.

**Notes attach to the subtree they govern**

A blueprint has no logic to read, so the design intent moves into doc
comments, placed on exactly the subtree they explain. Screen-scope decisions
(why this screen is not behind a shared guard, when a poll runs) go on the
screen. A rule that only governs one leaf goes on that leaf:

```tsx
/**
 * The address renders plain rather than split into a bright local part and a
 * dim domain: that split is a de-duplication device for lists that repeat one
 * domain down every row, and there is nothing to de-duplicate when one
 * address is stated once.
 */
const ActivityHeaderAddress = () => {
  const state = useActivity()
  if (state.status !== 'ready') return null

  return <Chrome.Subtitle>{state.record.address}</Chrome.Subtitle>
}
```

Inspecting any part of the tree brings its rationale with it; the module needs
no separate design document for decisions a leaf can carry.

**Leaves that grow parts become nested namespaces**

When one leaf develops named subparts, assemble a second-level namespace in
the leaf's own file. The file count does not change:

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

Promote the leaf to its own folder only when the prefix-repeats trigger fires
(see `organization-nest-when-prefix-repeats.md`).

**When not to blueprint**

A screen with one state and no gates is just a screen. Add
`<stem>.states.tsx` when the second render state appears, not before.

**Checklist**

- Can every state the screen can be in be read off the blueprint?
- Does each gate read context and decide its own visibility?
- Do gates read module context rather than a props bag the screen assembles?
- Is state precedence derived once as a discriminated status, not restated
per gate?
- Is the screen file free of data reads, router reads, conditionals, and
layout logic?
- Do design notes sit on the exact subtree they govern?
- Are second-level parts nested namespaces in the leaf's file, not new files?

## 3. Public API boundaries

### 3.1 Export one module root by default

For both shared components and route-bound module folders, export one module
root by default. This keeps internal structure free to change without churn for
callers.

**Bad: export the entire inside of the folder**

```ts
export { CheckoutScreen } from "./checkout.screen"
export { CheckoutList } from "./checkout.list"
export { useCheckoutData } from "./checkout.data"
export { CheckoutSummary } from "./checkout.summary"
```

Problems:

- callers couple to internal layout
- every refactor becomes a breaking import change
- public API expands faster than the actual design intent

**Good: export only intentional public entry points**

```ts
export { Checkout } from "./checkout"
```

```ts
export { Faculty } from "./faculty"
export { FacultyDirectoryScreen } from "./faculty.directory.screen"
export { FacultyDetailScreen } from "./faculty.detail.screen"
```

The same rule applies to compound components:

```ts
export { Composer } from "./composer"
```

The rule is not "always exactly one export". It is "exports match intentional
public entry points". One root is the default; screens become top-level
exports when a module has two or more screens (see
`architecture-route-bound-module-folders.md`).

Keep internal leaves internal unless they are intentionally designed as public
entrypoints.

**Exports are proven by consumers**

Every export is a claim that a consumer exists. When restructuring an
existing barrel, audit the claim: search for each symbol outside the module.
An export nobody imports is not public API — delete it during the refactor
rather than carrying it into the new boundary. Barrels accumulate dead
exports because exporting once felt harmless; the restructure is the moment
that debt gets paid, not preserved.

**Reasonable exceptions**

Export additional symbols only when they are truly part of the public contract:

- a documented type meant for external consumers
- a route helper explicitly reused outside the module
- a test utility in a clearly separate testing boundary

If an exception exists, document it rather than letting the barrel grow
implicitly.

**Checklist**

- Does `index.ts` export only intentional public entry points (root by default,
plus top-level screens when a module has two or more screens)?
- Are callers importing the namespace instead of internal leaves?
- Has every export kept through a refactor been proven by a consumer search?
- Are exceptions intentional and documented?

## 4. Naming stems and suffixes

### 4.1 Keep one stem and use responsibility-driven suffixes

Naming should make ownership obvious before opening the file.

The default pattern in this skill is:

- one folder stem
- one repeated file stem
- one responsibility suffix per file

**Bad: mixed naming styles inside one folder**

```text
checkout/
  index.tsx
  useCheckout.ts
  CheckoutScreen.tsx
  helpers.ts
  types.ts
```

Problems:

- no consistent stem
- unclear ownership
- file purpose is hidden behind generic names

**Good: consistent stem plus explicit suffixes**

```text
checkout/
  checkout.tsx
  checkout.screen.tsx
  checkout.data.ts
  checkout.summary.tsx
  checkout.types.ts
  index.ts
```

**Per-folder reset**

The stem rule applies per folder boundary. A nested folder (see
`organization-nest-when-prefix-repeats.md`) resets the stem to the folder's own
name: `checkout/billing/billing.form.tsx` is correct;
`checkout/billing/checkout.billing.form.tsx` is not. Role folders reset the
same way: `composer/layout/layout.close-button.tsx` (see
`organization-group-by-role.md`).

**Stems never cross module boundaries**

A module's files and component names carry that module's stem, never a
sibling's. `PayLinkState*` components inside `pay-share-link/` make every
search for either stem land in two modules, and read as one module's
internals living in the other. Renaming to the owning stem is part of any
refactor that touches the file, not polish to defer.

Useful suffixes:

- `.screen.tsx` for route-facing screens
- `.page.tsx` for page-oriented repos
- `.data.ts` for module-owned orchestration
- `.params.ts` for module-owned route-param parsing
- `.types.ts` for shared types
- `.context.tsx` for provider wiring
- `.states.tsx` for self-gating state leaves (see
`architecture-screen-blueprints.md`)
- `.display.tsx` for read-oriented compound leaves
- `.actions.tsx` for interactive compound leaves
- `.utils.ts` for pure helpers
- `.constants.ts` for static configuration
- `.md` for scoped documentation

**Adaptation rule**

Do not force a second naming system onto a mature repo. If the repo already uses
PascalCase files or another coherent style, preserve that style and translate
the structure:

- keep one stem
- keep explicit responsibilities
- keep one public boundary

Consistency matters more than whether the repo chooses kebab-case or PascalCase.

**Checklist**

- Do all module-owned files share a stem?
- Do component names carry this module's stem rather than a sibling's?
- Does each suffix communicate one clear responsibility?
- Are generic names like `helpers.ts` or `stuff.ts` avoided?
- Is the repo's existing naming system being preserved when it is already coherent?

## 5. Organization heuristics

These rules describe *when* to move between layouts the earlier sections define. They are triggers, not new structures: apply them to decide when a flat layout should nest, when peers should group, and when colocated code should be lifted.

### 5.1 Nest folders when filename prefixes repeat

A flat module that started with two or three files eventually grows into a
dozen. Once multiple files share the same prefix, the prefix is no longer
distinguishing information. It is noise.

**Trigger:** three or more sibling files share the same leading stem (e.g.
`calendar.detail.*`). Promote the shared prefix to a folder and give the folder
its own `index.ts`.

Keep a short sub-stem on files inside the new folder
(`detail/detail.header.tsx`, not `detail/header.tsx`). This preserves the one-
stem-per-module rule from `naming-stems-and-suffixes.md` and keeps search terms
like `detail.header` resolvable across the repo.

**Bad: flat layout with repeated prefixes**

```text
screens/
  calendar.detail.header.tsx
  calendar.detail.list.tsx
  calendar.detail.footer.tsx
  calendar.detail.utils.ts
  calendar.detail.data.ts
  calendar.detail.types.ts
  calendar.detail.index.ts
  calendar.list.tsx
  calendar.data.ts
  calendar.types.ts
```

Problems:

- the `detail` prefix is repeated in every filename with no structural payoff
- `calendar.detail.*` and `calendar.*` interleave when sorted, hiding ownership
- there is no public boundary: every file looks equally importable
- the `detail` subtree cannot be moved or deleted as a unit

**Good: nest once the prefix repeats**

```text
screens/
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

The folder now carries the prefix. The files keep the sub-stem so intent stays
legible both inside and outside the folder. `index.ts` becomes the public
boundary (see `boundaries-public-api.md`); internal leaves stay internal
unless intentionally exposed.

**Naming stays mechanical**


| File                           | Exports                |
| ------------------------------ | ---------------------- |
| `composer/composer.input.tsx`  | `ComposerInput`        |
| `composer/composer.footer.tsx` | `ComposerFooter`       |
| `composer/index.ts`            | `Composer` (namespace) |


The path maps 1:1 to the component name so agents and humans never have to
guess where `Composer.Input` lives.

**When not to nest**

- the folder would contain only one or two files
- the shared prefix appears only twice and has no signs of growing
- nesting would be purely aesthetic (keep symmetry for symmetry's sake out)

Count the folder the refactor produces, not the folder you start with: a
two-file cluster that the same plan grows into a compound (provider, gates,
screen) already meets the trigger. Tests move with their cluster into its
`__test__/` but do not count toward the trigger. Inside a module already past
the role-folder length trigger, a two-file cluster that is a real owned seam
may still nest — name that reason in the plan or commit so the below-trigger
fold reads as a decision, not drift.

When no prefix repeats but the flat listing has grown long anyway, that is
the sibling trigger: group by role instead (see
`organization-group-by-role.md`).

**Barrel caveat**

Subfolders may have a local `index.ts` only when they represent a real subflow
with its own public API consumed by parent siblings (the nested `detail/`
example above is such a case). Otherwise, imports inside the subfolder should
reference files directly (`./detail.header`), and the module's root
`index.ts` remains the sole public boundary.

**Checklist**

- Do three or more sibling files share the same leading stem?
- Would promoting the stem to a folder collapse repetition without inventing
new names?
- Does the new folder expose only an intentional public API via `index.ts`?
- Is the sub-stem preserved on files inside the folder?

### 5.2 Group peer leaves into role folders when a flat module grows long

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

### 5.3 Colocate internals until a second consumer appears

Module-owned helpers, data, and types belong next to the component that uses
them. Keep tests in a module-local `__test__/` folder instead of scattering
test files across the module root. Lifting code into a shared `lib/`,
`shared/`, or `utils/` location before a second consumer exists creates the
illusion of reuse and weakens ownership.

**Trigger:** a second consumer actually imports the helper. Until then,
colocate.

**Bad: extracted before a second consumer exists**

```text
src/
  lib/
    format-date.ts          // used only by calendar.detail
    detail-utils.ts         // used only by calendar.detail
  screens/
    calendar/
      detail/
        detail.header.tsx   // imports from ../../../lib/format-date
```

Problems:

- `lib/` advertises reuse that does not exist
- refactoring `detail` now requires edits in an unrelated directory
- later readers cannot tell shared code from code hoisted too early

**Good: colocate until reuse is proven**

```text
src/
  screens/
    calendar/
      detail/
        detail.header.tsx
        detail.utils.ts     // format-date lives here
        detail.data.ts
        __test__/
          detail.header.test.tsx
        index.ts
```

When a second domain module actually imports the helper, promote it then:

```text
src/
  lib/
    format-date.ts          // now has two consumers
  screens/
    calendar/detail/...
    cart/...
```

**Rules of thumb**

- one consumer: colocate
- two consumers in the same module tree: lift to the nearest common parent
- two or more consumers across unrelated domain modules: lift to `lib/` or
`shared/`
- when nesting a subflow folder (see `organization-nest-when-prefix-repeats.md`),
move data that is only consumed inside the subflow into a colocated `*.data.ts`;
data consumed by both the root module and the subflow stays in the module-level
`*.data.ts` until a second consumer proves it should split
- tests live in `__test__/` within the same module
(`detail/__test__/detail.header.test.tsx`)
- types used only inside a folder stay in `*.types.ts` within that folder;
types crossing a folder boundary are exported via `index.ts`

**Why this pairs with the earlier rules**

Compound component folders (see `architecture-compound-component-folders.md`)
and route-bound module folders (see
`architecture-route-bound-module-folders.md`) both treat a folder as an
ownership boundary. Colocation is the same idea applied to non-component code:
the folder owns its internals and `index.ts` decides what leaks out. Together
these rules make modules **movable**: a folder can be relocated or deleted as
a unit without hunting for strays in shared directories.

**Checklist**

- Does a second consumer actually exist before lifting the helper?
- Do helpers, data, and types live next to their consumer, with tests in
module-local `__test__/` folders?
- When code is lifted, is it lifted to the nearest real common ancestor?
- Is `lib/` or `shared/` reserved for code that two or more modules import?
