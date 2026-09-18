---
title: Compose screens as declarative blueprints
slug: architecture-screen-blueprints
group: Route-bound module folders
groupNumber: 2
section: "2.2"
impact: HIGH
tags: screens, state-gates, compound-components, colocated-docs
---

## Compose screens as declarative blueprints

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
