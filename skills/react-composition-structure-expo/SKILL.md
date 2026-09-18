---
name: react-composition-structure-expo
description: File structure for Expo Router apps. Use when adding or restructuring a screen, deciding what a route file under `app/` contains, moving screen code out of `app/`, pointing two routes at one screen, or naming platform-specific files such as `.ios.tsx` inside a module.
metadata:
  author: oliverpan
  version: 2.0.0
---

# React composition structure for Expo Router

## Stop if the shared skill is missing

Check that `../react-composition-structure/SKILL.md` exists before anything
else. If it does not exist, do not create or edit any file, and do not
continue with the rules below. Reply with the reason and this command, then
wait for the user:

```bash
npx skills add fluid-design-io/react-composition-structure --skill react-composition-structure
```

The rules below use the shared skill's vocabulary (root, leaf, gate,
blueprint, stem) and its naming and folder rules. Work done without them
needs redoing.

## Check that this skill applies

It applies when the nearest `package.json` lists `expo-router` and the package has `app/_layout.tsx` or `src/app/_layout.tsx`. If the evidence does not match, go back to the router table in the
shared skill.

Then read `../react-composition-structure/SKILL.md`, if you have not read it
in this session.

## What this skill covers

One rule, `rules/expo-module-outside-app.md`. It says where a screen's module
lives in an Expo Router app and what a route file contains. The official
Expo docs and the official `expo` skills own navigation, native UI, and data
fetching, and they win any conflict. Tell the user what conflicted.

Verified against the Expo Router documentation. No build fixture covers this
skill.
