import type { Metadata } from "next"

export const generateMetadata = async (): Promise<Metadata> => ({ title: "Invite" })

export async function generateStaticParams() {
  return [{ token: "new" }, { token: "old" }]
}
