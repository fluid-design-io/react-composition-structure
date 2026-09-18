import "server-only"
import { cacheLife } from "next/cache"
import type { InviteRecord } from "./invite.types"

export async function getInvite(token: string): Promise<InviteRecord> {
  "use cache"
  cacheLife("minutes")

  return { token, sender: "Ada", status: token === "old" ? "expired" : "pending" }
}
