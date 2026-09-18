"use client"

import { useInviteContext } from "./invite.context"

export function InviteSender() {
  const { state } = useInviteContext()

  return <p>From {state.invite.sender}</p>
}

export function InviteAccept() {
  const { state, actions } = useInviteContext()

  return (
    <button onClick={actions.accept} disabled={state.accepting}>
      Accept
    </button>
  )
}
