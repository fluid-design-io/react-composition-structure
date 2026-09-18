> Note:
> This guide is written for agents and AI-assisted refactors. It covers
> folders, file ownership, export boundaries, naming, and how a screen file
> reads.

## Abstract

A React codebase gets hard to maintain when the UI uses composition patterns
and the file system does not show them. The symptoms are large single files,
modules that export everything, generic file names, and route files that own
domain orchestration.

This guide has five rule areas:

1. shared component folders
2. route-bound domain modules, screen blueprints, and module placement
3. public API boundaries
4. naming stems and suffixes
5. organization heuristics, which say when to nest, group, and lift

The rules share one vocabulary: root, leaf, gate, nested namespace,
blueprint, subflow folder, and role folder. Every rule applies to React DOM
and React Native.

Shape and placement are separate questions. Shape is the same under every
router, and most of this guide describes it. *Feature* means the domain module
being restructured (checkout, calendar, cart), not a `features/` directory.
Example trees have no parent directory, because they show shape only.

Placement is where a route-bound module sits relative to its route file. It
depends on the router. Rule 2.3 decides it from workspace evidence before you
create or move a module. Rule 2.4 is the default placement. The Next.js, Expo
Router, and TanStack Start placements each have their own skill.
