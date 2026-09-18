import { notFound } from "next/navigation"
import { PostBody, PostHeader } from "./post.display"
import { getPost } from "./post.server"
import { PostSkeleton } from "./post.skeleton"

async function PostRoot({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  return (
    <article>
      <PostHeader title={post.title} author={post.author} />
      <PostBody content={post.content} />
    </article>
  )
}

export const Post = Object.assign(PostRoot, { Skeleton: PostSkeleton })
