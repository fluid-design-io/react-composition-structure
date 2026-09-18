---
title: Use gates for client state and variants for server state
slug: nextjs-states-gates-and-variants
group: Next.js App Router
groupNumber: 1
section: "1.5"
impact: HIGH
tags: nextjs, state-gates, variants, server-state
---

## Use gates for client state and variants for server state

A gate reads context, so a gate is a Client Component. It can only express
state the browser knows. State that the server decides needs a different
form.

| The state comes from | Write it as | In |
| --- | --- | --- |
| the browser: offline, an optimistic update, a refetch, an open panel | a gate | `<stem>.states.tsx` |
| server data, and there is nothing to show: not found, empty, not entitled | an early return in the root, or `notFound()` | `<stem>.tsx` |
| server data, and each state is a different screen | explicit variants | `<stem>.variants.tsx` |

A `notFound()` call inside a streamed root runs after the shell has started
to send. Read the `not-found` doc for what that does to the response status
before you rely on it, and ask the user if the route needs a real 404.

**Variants**

When server data picks between different screens, write each screen as its
own declarative tree. One async switch component picks between them. This is
the "explicit variants" pattern from Vercel's composition patterns guide,
rule 3.1.

```tsx
// invite.variants.tsx
export async function InviteVariant({ params }: InviteProps) {
  const invite = await getInvite((await params).token)

  if (invite.status === "expired") return <InviteExpired />
  if (invite.status === "accepted") return <InviteAccepted invite={invite} />
  return <InvitePending invite={invite} />
}

function InvitePending({ invite }: { invite: Invite }) {
  return (
    <Invite seed={invite}>
      <Invite.Sender />
      <Invite.Accept />
    </Invite>
  )
}
```

```tsx
// page.tsx
<Suspense fallback={<Invite.Skeleton />}>
  <InviteVariant params={params} />
</Suspense>
```

The switch is the only place that branches. A reader opens one file and sees
every screen the route can show.

**Bad: a config array of render functions**

```tsx
const STEPS = [
  { status: "pending", component: (invite) => <InvitePending invite={invite} /> },
  { status: "expired", component: () => <InviteExpired /> },
]
```

The screens hide inside data. Nobody can read the route's states without
running the lookup in their head.

**A gate hides content. It does not protect it**

The server renders the children of a client gate and sends them to the
browser whether or not the gate shows them. Never put content the viewer must
not receive under a gate. Decide that on the server, in the root or the
switch.

**Checklist**

- Does every gate express state that only the browser knows?
- Are nothing-to-show cases early returns in the root?
- Does one switch in `<stem>.variants.tsx` pick between server-decided
screens?
- Is every access decision made on the server?

**Official docs:** `server-and-client-components` (Interleaving Server and
Client Components), `data-security`, `not-found`.
