import { useState } from "react"
import { useLoader, useParams, type LoaderProps } from "one"
import { readProfile } from "@/server/profile.server"
import { ProfileCard } from "./ProfileCard"

export async function loader({ params }: LoaderProps<{ id: string }>) {
  return readProfile(params.id)
}

export default function ProfilePage() {
  const profile = useLoader(loader)
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<"posts" | "followers">("posts")
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(profile?.bio ?? "")

  if (!profile) {
    return (
      <main>
        <p>No profile found for {id}.</p>
      </main>
    )
  }

  return (
    <main>
      <ProfileCard name={profile.name} joined={profile.joined} />
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setEditing(false)
          }}
        >
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} />
          <button type="submit">Save</button>
        </form>
      ) : (
        <section>
          <p>{bio || "No bio yet."}</p>
          {profile.isOwner && <button onClick={() => setEditing(true)}>Edit bio</button>}
        </section>
      )}
      <nav>
        <button aria-pressed={tab === "posts"} onClick={() => setTab("posts")}>Posts ({profile.posts.length})</button>
        <button aria-pressed={tab === "followers"} onClick={() => setTab("followers")}>Followers ({profile.followers.length})</button>
      </nav>
      {tab === "posts" ? (
        profile.posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul>{profile.posts.map((post) => <li key={post}>{post}</li>)}</ul>
        )
      ) : (
        <ul>{profile.followers.map((follower) => <li key={follower}>{follower}</li>)}</ul>
      )}
    </main>
  )
}
