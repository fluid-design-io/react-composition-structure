export function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase()
}

export function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short" })
}
