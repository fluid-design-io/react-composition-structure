import type { Metadata } from "next"

export async function generateMetadata({ params }: PageProps<"/orders/[id]">): Promise<Metadata> {
  const { id } = await params

  return { title: `Order ${id}` }
}

export async function generateStaticParams() {
  return [{ id: "1" }]
}
