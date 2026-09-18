// A page that was itself cached. The function moved here whole, with its
// directive, and page.tsx renders it.
export async function Terms() {
  "use cache"

  return (
    <main>
      <h1>Terms</h1>
      <p data-slot="terms-body">Cached terms body.</p>
    </main>
  )
}
