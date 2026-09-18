import { Suspense } from "react"
import { Invite } from "./invite"
import { InviteVariant } from "./invite.variants"

export { generateMetadata, generateStaticParams } from "./invite.metadata"

export default function InvitePage({ params }: PageProps<"/invite/[token]">) {
  return (
    <main>
      <h1>You are invited</h1>
      <Suspense fallback={<Invite.Skeleton />}>
        <InviteVariant params={params} />
      </Suspense>
    </main>
  )
}
