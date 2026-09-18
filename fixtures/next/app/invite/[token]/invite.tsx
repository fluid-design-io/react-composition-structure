import type { PropsWithChildren } from "react"
import { InviteProvider } from "./invite.context"
import { InviteAccept, InviteSender } from "./invite.display"
import { InviteSkeleton } from "./invite.skeleton"
import type { InviteRecord } from "./invite.types"

function InviteRoot({ seed, children }: PropsWithChildren<{ seed: InviteRecord }>) {
  return <InviteProvider seed={seed}>{children}</InviteProvider>
}

export const Invite = Object.assign(InviteRoot, {
  Sender: InviteSender,
  Accept: InviteAccept,
  Skeleton: InviteSkeleton,
})
