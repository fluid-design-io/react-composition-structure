---
tags: [skill-creator]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

`bun run build` fails with "Cannot read properties of undefined (reading 'split')" on route /profile/ProfileCard. Fix the build. app/profile/[id]+ssr.tsx has also grown into a mess, so clean up the profile screen while you are in there. Keep the behavior the same.

Input files: the One app project (package.json, vite.config.ts, app/, src/)
