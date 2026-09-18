import { PostsHeader } from "./posts.header"

export { metadata } from "./posts.layout.metadata"

export default function PostsLayout({ children }: LayoutProps<"/posts">) {
  return (
    <div>
      <PostsHeader />
      {children}
    </div>
  )
}
