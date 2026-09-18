"use client"

import { createContext, use, useState, type PropsWithChildren } from "react"
import type { InviteRecord } from "./invite.types"

type InviteContextValue = {
  state: { invite: InviteRecord; accepting: boolean }
  actions: { accept: () => void }
  meta: Record<string, never>
}

const InviteContext = createContext<InviteContextValue | null>(null)

export function useInviteContext() {
  const value = use(InviteContext)
  if (!value) throw new Error("useInviteContext must be used inside <Invite>")
  return value
}

export function InviteProvider({ seed, children }: PropsWithChildren<{ seed: InviteRecord }>) {
  const [accepting, setAccepting] = useState(false)
  const value: InviteContextValue = {
    state: { invite: seed, accepting },
    actions: { accept: () => setAccepting(true) },
    meta: {},
  }

  return <InviteContext value={value}>{children}</InviteContext>
}
