export function PostHeader({ title, author }: { title: string; author: string }) {
  return (
    <header>
      <h1>{title}</h1>
      <p>By {author}</p>
    </header>
  )
}

export function PostBody({ content }: { content: string }) {
  return <p>{content}</p>
}
