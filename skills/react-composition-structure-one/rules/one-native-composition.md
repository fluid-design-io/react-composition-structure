---
title: Keep native hosts explicit and native internals local
slug: one-native-composition
group: One framework
groupNumber: 1
section: "1.4"
impact: HIGH
tags: one, compose, swiftui, native-source, layout
---

## Keep native hosts explicit and native internals local

Use One APIs directly when a leaf needs no app-specific adaptation. A wrapper
earns its place by owning domain behavior, shared visual policy or a real
platform difference. Do not build a component library around every control.

Keep React Native host bounds separate from native descendant layout. A
Compose root's `style` participates in Yoga while nested nodes use
`composeStyle`. Give scrolling hosts a defined viewport. Check intrinsic
sizing against the installed version instead of assuming every control
measures the same way.

**Bad**

```tsx
<One.Android.Column style={{ flex: 1 }}>
  <One.Android.Button label="Continue" style={{ flex: 1 }} />
</One.Android.Column>
```

The child receives a host layout prop, and neither boundary explains the
intended action size.

**Good**

```tsx
<One.Android.Column
  style={{ width: "100%", height: 80 }}
  composeStyle={{ padding: 12 }}
>
  <One.Android.Button
    label="Continue"
    onPress={continueFlow}
    composeStyle={{ fillMaxWidth: true }}
  />
</One.Android.Column>
```

This demonstrates a boundary, not a universal control height. SwiftUI has its
own styling contract. Read the component's current types and reference
instead of translating Compose props by analogy.

Use only the child shapes a native host supports. A gate or provider inside
a native tree must preserve that shape; a React wrapper does not make an
arbitrary host view a supported native child.

Platform leaves stay inside the module, such as `checkout.actions.android.tsx`
and `checkout.actions.ios.tsx`. Consumers use extensionless imports. Put native
source outside routes and generated projects. Keep feature-specific source
with its feature when the configured scanner supports it. Generated native
declarations stay beside their source as One's tooling requires.

A native view owning a complete interaction can remain one leaf with typed
props and callbacks. Split it only when React consumers compose meaningful
parts. Do not duplicate its state in JavaScript to imitate an old UI.

Host bounds, safe areas, keyboards, system appearance and native colors must
work together. Put measurement and platform hooks in the owning layout leaf
or adapter, keeping the screen declarative. Each inset and keyboard
adjustment has one owner.

Native source changes require regeneration and a native rebuild. Validate
the affected screen and callbacks in that binary. A typecheck or web preview
proves a different boundary.

**Checklist**

- Does the blueprint expose meaningful native hosts and presentations?
- Are host bounds and native child layout at the correct boundary?
- Does each wrapper own a concrete adaptation?
- Are native source and generated outputs in supported locations?
- Were keyboard, appearance and callbacks checked in the target runtime?

**Official docs**

https://onestack.dev/docs/native-platforms
https://onestack.dev/docs/native-source
https://onestack.dev/docs/native-setup
