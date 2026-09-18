import "server-only"
import { cacheLife } from "next/cache"

export async function getPost(slug: string) {
  "use cache"
  cacheLife("hours")

  if (slug === "missing") return null
  return { slug, title: "Hello", author: "Ada", content: "First post." }
}
