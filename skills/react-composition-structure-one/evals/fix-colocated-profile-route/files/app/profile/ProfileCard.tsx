import { initials, formatJoined } from "./utils"

export function ProfileCard({ name, joined }: { name: string; joined: string }) {
  return (
    <div className="card">
      <span className="avatar">{initials(name)}</span>
      <h1>{name}</h1>
      <p>Joined {formatJoined(joined)}</p>
    </div>
  )
}
