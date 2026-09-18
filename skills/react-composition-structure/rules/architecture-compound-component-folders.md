---
title: Use compound component folders for shared multi-part UI
slug: architecture-compound-component-folders
group: Component folders
groupNumber: 1
section: "1.1"
impact: HIGH
tags: file-organization, compound-components, state-sharing
---

## Use compound component folders for shared multi-part UI

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
