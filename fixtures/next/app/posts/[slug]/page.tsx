import { Suspense } from "react"
import { Post } from "./post"

export { generateMetadata, generateStaticParams } from "./post.metadata"

export default function PostPage({ params }: PageProps<"/posts/[slug]">) {
  return (
    <main>
      <Suspense fallback={<Post.Skeleton />}>
        <Post params={params} />
      </Suspense>
    </main>
  )
}
