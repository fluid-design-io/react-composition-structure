import type { Metadata } from "next"
import { getPost } from "./post.server"

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug)

  return { title: post?.title ?? "Not found" }
}

export async function generateStaticParams() {
  return [{ slug: "hello" }]
}
