---
tags: [skill-creator]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Add a POST /api/orders/[id]/items endpoint that appends an item (JSON body { name }) to an order, and an "Add item" form on the order detail screen that calls it and then shows the updated list.

Input files: the One app project (package.json, vite.config.ts, app/, src/)
