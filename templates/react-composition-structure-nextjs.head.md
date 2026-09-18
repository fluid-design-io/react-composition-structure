> Note:
> This guide adds Next.js App Router rules to the shared
> `react-composition-structure` skill. Read that skill first. It defines the
> vocabulary these rules use.

## Abstract

In the App Router a route's module lives in its segment, and `page.tsx` is
the blueprint. The page is a sync Server Component. It shows the static
shell, every streamed part, and every client gate in one tree. These rules
cover where files go and how the page reads. The official Next.js docs and
skills own rendering, caching, and prefetching, and they win any conflict.
