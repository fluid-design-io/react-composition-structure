import { readFile } from "node:fs/promises"

const profiles: Record<string, { name: string; joined: string; bio: string; posts: string[]; followers: string[] }> = {
  ada: { name: "Ada Lovelace", joined: "2024-03-01", bio: "", posts: ["Notes on the engine"], followers: ["charles"] }
}

export async function readProfile(id: string) {
  await readFile(new URL(import.meta.url)).catch(() => null)
  const profile = profiles[id]
  return profile ? { ...profile, isOwner: id === "ada" } : null
}
