---
title: Read each fact from the one place that owns it
slug: architecture-read-state-from-its-owner
group: Component folders
groupNumber: 1
section: "1.2"
impact: HIGH
tags: state-ownership, actors, stores, selectors, context
---

## Read each fact from the one place that owns it

A leaf reads state from one of two places. One is a module context value
(`state`, `actions`, `meta`) that a provider builds. The other is an actor or
a store, which the leaf reads through selectors and drives with events. An
actor here means any long-lived owner with a snapshot and typed events, such
as a state machine or an external store. Choose by asking who owns the fact.

| The fact | Where a leaf reads it |
| --- | --- |
| An actor or store already owns it | That actor, through a named selector. The leaf sends events to it. |
| It is local UI state, or derived from several hooks that no actor owns | The module context value |
| A shared component that several modules use consumes it | A value prop that the provider builds from selectors |

Each fact has exactly one source. Never mirror an actor field into the module
context.

**Bad: the provider copies the actor into a context value**

```tsx
function CheckoutProvider({ children }: PropsWithChildren) {
  const actor = useActor(checkoutLogic)
  const snapshot = useSnapshot(actor)

  const value = {
    state: {
      items: snapshot.context.items,
      isSubmitting: snapshot.value === "submitting",
    },
    actions: {
      submit: () => actor.send({ type: "submit" }),
      removeItem: (id: string) => actor.send({ type: "removeItem", id }),
    },
  }

  return <CheckoutContext value={value}>{children}</CheckoutContext>
}
```

Problems:

- `items` and `isSubmitting` now have two owners, and the copy can drift
- each action relays one event and hides the actor's typed events
- every leaf re-renders on every snapshot, because the value is rebuilt whole
- the next change has two places to go, so it often lands in both

**Good: the provider provides the actor, and leaves select from it**

The file that owns the actor's logic also exports its selectors:

```ts
// checkout.machine.ts
// ...the actor's logic and its typed events

export const selectItems = (snapshot: CheckoutSnapshot) => snapshot.context.items

export const selectCanSubmit = (snapshot: CheckoutSnapshot) =>
  snapshot.value === "editing" && snapshot.context.items.length > 0
```

The provider creates the actor, sends outside values in as events, and
provides it. It holds no copied flags and no relay actions:

```tsx
// checkout.context.tsx
export function CheckoutProvider({ cartId, children }: CheckoutProviderProps) {
  const actor = useActor(checkoutLogic, { input: { cartId } })
  const online = useNetworkStatus()

  useEffect(() => {
    actor.send({ type: "networkChanged", online })
  }, [actor, online])

  return <CheckoutActorContext value={actor}>{children}</CheckoutActorContext>
}
```

Each leaf selects its own slice and sends events directly, so it re-renders
only when that slice changes:

```tsx
// checkout.actions.tsx
export function CheckoutSubmit() {
  const actor = useCheckoutActor()
  const canSubmit = useSelector(actor, selectCanSubmit)

  return <Button disabled={!canSubmit} onPress={() => actor.send({ type: "submit" })} />
}
```

Use the selector hook and the event API your state library provides. A typed
trigger such as `actor.trigger.submit()` follows the same rule.

**Name a selector once it derives or repeats**

An inline read of one plain field is fine, such as
`useSelector(actor, (snapshot) => snapshot.context.note)`. A read that
derives a value, or that a second leaf needs, becomes a named selector beside
the logic.

```tsx
// checkout.actions.tsx
useSelector(actor, (snapshot) => snapshot.value === "editing" && snapshot.context.items.length > 0)

// checkout.footer.tsx
useSelector(actor, (snapshot) => snapshot.context.items.length > 0)
```

These two leaves already disagree about when checkout can submit. Both should
call `selectCanSubmit`.

**The context value keeps two jobs**

The `state`, `actions`, `meta` value from
`architecture-compound-component-folders.md` stays the right tool for:

- state that no actor owns, such as a selected tab, a measured height, or a
status derived from a query and a network hook together
- a shared component that several modules use and that takes a value prop

For the shared component, each module's provider builds the value from its
own selectors. The shared leaves never learn which actor feeds them, and the
relay actions are fine here because the shared contract asks for them:

```tsx
function CheckoutSummaryProvider({ children }: PropsWithChildren) {
  const actor = useCheckoutActor()
  const items = useSelector(actor, selectItems)

  const value = {
    state: { lines: items },
    actions: { remove: (id: string) => actor.send({ type: "removeItem", id }) },
  }

  return <OrderSummary.Provider value={value}>{children}</OrderSummary.Provider>
}
```

**A screen may have both**

The actor context carries the facts the machine owns. The module context
carries the facts it does not, such as which sheet is open. A gate or leaf
may read either. A fact appears in only one of them.

**Render boundaries re-provide the actor**

A portal, a modal host, or any boundary that drops React context gets the
same actor instance again, never a relay of its values:

```tsx
<Portal>
  <CheckoutActorContext value={actor}>
    <Checkout.Sheet />
  </CheckoutActorContext>
</Portal>
```

**A coherent existing convention stays**

If a package already reads its actors one way throughout, follow it, and
tell the user in one line where it differs from this rule. If the package
mixes both patterns for the same kind of fact, follow this rule in new work
and tell the user about the mix in one line.

**Checklist**

- Did you find the owner of each fact before choosing where a leaf reads it?
- Does the provider only create the actor, provide it, and send outside
values in as events?
- Is every derived or repeated read a named selector in the file that owns
the logic?
- Do leaves send events to the actor instead of calling relay actions?
- Does each fact appear in exactly one context?
- Does each render boundary re-provide the same actor instance?
