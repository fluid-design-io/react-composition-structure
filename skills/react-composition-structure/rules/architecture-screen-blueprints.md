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

When a screen has several render states (loading, offline, error, empty,
ready), keep the screen file a **blueprint**: a declarative tree of the
module's compound leaves, with no branching, no data reads, and no layout
logic. Each state becomes a **gate**, a leaf that reads the module context and
returns `null` unless its state holds. The parent never decides visibility;
each subtree decides for itself.

Gates and blueprints are pure React. Nothing here touches a platform API, so
the pattern is identical in React DOM and React Native.

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
- Is the screen file free of data reads, conditionals, and layout logic?
- Do design notes sit on the exact subtree they govern?
- Are second-level parts nested namespaces in the leaf's file, not new files?
