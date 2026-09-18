> Note:
> This guide adds one TanStack Start rule to the shared
> `react-composition-structure` skill. Read that skill first.

## Abstract

TanStack's route generator owns `src/routes/`. A route's module lives in a
`-<stem>/` folder beside the route file, where the generator ignores it. The
route file connects module exports to `createFileRoute` options.
