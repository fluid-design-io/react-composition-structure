import { Invite } from "./invite"
import { getInvite } from "./invite.server"
import type { InviteRecord } from "./invite.types"

type InviteVariantProps = { params: Promise<{ token: string }> }

export async function InviteVariant({ params }: InviteVariantProps) {
  const invite = await getInvite((await params).token)

  if (invite.status === "expired") return <InviteExpired />
  if (invite.status === "accepted") return <InviteAccepted invite={invite} />
  return <InvitePending invite={invite} />
}

function InvitePending({ invite }: { invite: InviteRecord }) {
  return (
    <Invite seed={invite}>
      <Invite.Sender />
      <Invite.Accept />
    </Invite>
  )
}

function InviteAccepted({ invite }: { invite: InviteRecord }) {
  return (
    <Invite seed={invite}>
      <Invite.Sender />
      <p>You already accepted this invite.</p>
    </Invite>
  )
}

function InviteExpired() {
  return <p>This invite has expired.</p>
}
