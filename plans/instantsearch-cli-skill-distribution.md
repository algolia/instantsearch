# InstantSearch CLI: Skill Distribution

**TL;DR:** The agent skill that drives the InstantSearch CLI has two kinds of knowledge: stable workflow (how to use the CLI, where to mount components, core rules) and feature-specific guidance that evolves with each release (Autocomplete replaces SearchBox, new widget mounting rules). The stable part lives in the skills.sh skill itself. The evolving part ships inside the `instantsearch.js` npm package and is read from `node_modules` at runtime — version-matched, no drift. If packages aren't installed yet, the skill falls back to GitHub for the latest version.

## The problem

The InstantSearch CLI handles deterministic tasks (framework detection, index introspection, code generation). An AI agent handles contextual tasks (mounting components, styling, layout). The agent needs a skill — a set of instructions — to know how to drive the CLI and what to do after.

As the CLI grows, the skill must grow with it. New features surface new guidance: Autocomplete replaces SearchBox, don't mount both. A future store locator might have its own mounting rules. This guidance is only discovered through usage and must stay tightly coupled to the CLI's release cycle.

Two constraints pull in opposite directions:

1. **The skill must stay in sync with the CLI.** Every new feature can introduce workflow guidance the agent needs. If the skill drifts, agents produce broken results.
2. **The agent needs the skill before InstantSearch is installed.** The CLI installs InstantSearch packages, but the agent needs instructions to know how to run the CLI in the first place.

## The solution

Split the skill into two layers based on how frequently the content changes.

### 1. The skills.sh skill: stable workflow

This is what users install. It contains the core knowledge that rarely changes:

- **Division of labor** — the CLI handles deterministic tasks (framework detection, index introspection, code generation), the agent handles contextual tasks (mounting, styling, layout)
- **Core workflow** — init → introspect → add → mount → style → polish
- **Fundamental rules** — always use `--json --yes`, introspect before `add`, don't replace generated wrappers with hooks, don't regenerate files the CLI created
- **Mounting patterns** — provider at the app root, features on pages/routes

This layer is self-contained. An agent with only the skills.sh skill — before any packages are installed — can run the full CLI workflow correctly. It doesn't need `node_modules` to be useful.

### 2. The npm package: feature-specific guidance

The evolving part ships inside `instantsearch.js` — the core package that all flavors depend on (`react-instantsearch`, `vue-instantsearch`, and direct `instantsearch.js` users). It contains knowledge that changes with each release:

- **Feature-specific rules** — Autocomplete replaces SearchBox, styling consistency across widget types
- **New widget types** and their mounting rules
- **New templates** and their specific instructions
- **Updated flag surfaces** as the CLI adds commands

The skills.sh skill reads this file from `node_modules` at runtime when it exists, augmenting its stable foundation with version-matched feature guidance. If `node_modules` doesn't exist yet (first run, before packages are installed), it falls back to fetching the latest from GitHub.

## Why this works

**Useful on its own.** The skills.sh skill isn't just a pointer — it's a working skill. An agent without `node_modules` can still drive the CLI correctly using the stable workflow. The `node_modules` content enhances it, but doesn't gate it.

**No drift on what matters most.** Feature-specific guidance lives in the same repo as the CLI and ships in the same npm package. A PR that adds a feature updates the guidance in the same diff. CI can enforce this.

**Version-matched.** The agent reads feature guidance from `node_modules`, so it always matches the installed version of InstantSearch — not latest, not main, the exact version the developer is using.

**No network dependency in steady state.** Once packages are installed, reading from `node_modules` is local and instant. The GitHub fallback is only needed for the initial setup before packages exist.

**Resilient.** If `node_modules` is missing and GitHub is unreachable, the agent still has the stable skill — enough to run the CLI and produce correct output. Feature-specific polish may be missed, but the core flow works.

## What the skills.sh skill looks like

```markdown
---
name: add-search
description: 'Add Algolia InstantSearch to the current project using the InstantSearch CLI.'
---

# Add Search with InstantSearch CLI

You have access to the `instantsearch` CLI. It scaffolds correctly-wired
InstantSearch widget files into this project. Your job is to drive the CLI,
then go further: mount the generated components, style them, and integrate
them into the app's layout and routing.

## Division of labor

| The CLI handles (deterministic) | You handle (contextual) |
| --- | --- |
| Detecting flavor/framework/TypeScript | Choosing where search lives in the app |
| Verifying Algolia credentials | Mounting the provider in the root layout |
| Introspecting the Algolia index | Mounting the generated feature on a page/route |
| Generating provider, widget wrappers, index file | Styling and layout |
| Writing manifests, installing packages | Editing existing files (imports, routing, navigation) |

## Workflow

1. **Gather credentials** — check `.env` / `.env.local` or ask the user for
   Algolia app ID and search-only API key.
2. **Run `--help` first** — always run `npx instantsearch <command> --help`
   before running a command. Flag names may not match what you'd guess.
3. **init** → **introspect** → **add search** — run in order, always with
   `--json --yes`. Use introspect output to pick the best flag values for add.
4. **Mount** — wrap app root with the generated provider, render the feature
   on a page, add navigation.
5. **Style** — use whatever approach the project uses (Tailwind, CSS modules,
   etc.). Focus on the hit card.
6. **Polish** — page title, sidebar layout, responsive behavior, loading
   states, empty states.

## Rules

- Always use `--json --yes` when calling the CLI.
- Always introspect before `add`. Don't guess attribute names.
- Parse the JSON response and use `nextSteps` for integration.
- Never regenerate files the CLI created. Edit them instead.
- Don't replace bootstrapped widgets with hooks.
- Check `ok` before proceeding. If `false`, diagnose and fix.

## Feature-specific guidance

Read additional guidance from one of these locations, in order:

1. Local (version-matched): `node_modules/instantsearch.js/skill/SKILL.md`
2. GitHub (latest): `https://raw.githubusercontent.com/algolia/instantsearch/master/packages/instantsearch.js/skill/SKILL.md`

Use (1) if it exists. Fall back to (2) if InstantSearch isn't installed yet.
If neither is available, proceed with the rules above.
```

## What changes in practice

| Before | After |
|---|---|
| Full skill content duplicated on skills.sh | Stable workflow on skills.sh, feature guidance in npm package |
| Skill updates require a separate skills.sh publish | Feature guidance ships with the npm package in the same PR |
| New features can forget to update the skill | PR diff makes the gap visible; CI can enforce it |
| Skill drift discovered by users hitting agent bugs | Feature guidance stays in sync by construction |
| Skill may not match the installed version | Feature guidance always matches — it's part of the same package |
| Skill useless before packages are installed | Stable workflow works standalone; feature guidance augments it |

## Open questions

- **Package manager differences**: `node_modules` path resolution works for npm, yarn, and pnpm with default settings. Pnpm's strict mode or Plug'n'Play setups may need the agent to resolve the path differently. Worth testing but likely an edge case.
- **Granularity of feature guidance**: Should the npm package ship one `SKILL.md` covering all features, or per-feature files (like TanStack Intent's per-topic skills)? One file is simpler to start; per-feature files scale better as the catalog grows.

## FAQ

### Why not publish the full skill on skills.sh directly?

Two problems. First, drift: as the CLI grows and new features land, feature-specific guidance must be updated in lockstep. A skill on skills.sh has its own release cycle, its own lockfile, and no guarantee it stays current. Guidance shipped in the npm package updates automatically when the library updates — same PR, same review, same release.

Second, version matching: we can't ensure users update their skills.sh skills when they upgrade InstantSearch. A user on `instantsearch.js@4.90.0` with a stale skill written for `4.80.0` will get wrong instructions. When feature guidance lives in `node_modules`, it always matches the installed version.

### Why ship the feature guidance in `instantsearch.js`, not the CLI package?

The CLI is never installed — it's `npx`'ed. It leaves nothing in `node_modules`. `instantsearch.js` is the core package that all flavors depend on (`react-instantsearch`, `vue-instantsearch`, and direct JS users). It's always present in `node_modules` regardless of flavor, making it the single reliable location for the agent to find feature guidance.

### Why not just put the instructions in CLAUDE.md or project rules?

That works for a single project but doesn't scale. Every project that uses InstantSearch would need to maintain its own copy of the instructions, and there's no mechanism to keep them updated when the library changes. Shipping guidance in the package means every project gets the right instructions automatically — no manual setup, no per-project maintenance.

### Could we use TanStack Intent instead?

[TanStack Intent](https://tanstack.com/intent/latest) solves a similar problem: shipping AI agent skills inside npm packages, discovered from `node_modules`. Their registry indexes 125 packages with 465 skills. Libraries like `@tanstack/router-core` and `@trpc/server` already ship skills this way.

Intent's mechanism relies on a dedicated CLI (`intent install`) that scans dependencies and writes into agent config files (`CLAUDE.md`, `.cursorrules`). We can't expect our users to adopt Intent as a prerequisite, but the approach is worth watching. If Intent (or something like it) becomes a standard part of the JS toolchain, we could adopt it as an additional distribution channel alongside the skills.sh bootstrap. The npm package already contains the skill files — Intent would just be another way to discover them.

## Prior art

Three examples validate this approach from different angles:

**Next.js ships docs in `node_modules` and points agents at them.** Next.js includes documentation in `node_modules/next/dist/docs/` and [generates agent config files](https://github.com/vercel/next.js/blob/7240c74b23bdff2ef5288b906eab8d69e91c597e/packages/next/src/server/lib/generate-agent-files.ts#L26) that explicitly warn agents: "This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code." This is the same core insight: the installed package is the source of truth, not the agent's training data.

**Vercel's web-design-guidelines skill splits stable workflow from evolving content.** The [skill on skills.sh](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) owns the orchestration (how to apply rules, what format to output, when to trigger) and instructs the agent to fetch the latest rules from a GitHub URL before each review. The skill is useful on its own for the workflow; the remote content augments it with the latest domain knowledge. This is the pattern we're following.

**TanStack Intent ships skills inside npm packages.** [TanStack Intent](https://tanstack.com/intent/latest) indexes 125 packages with 465 skills, all shipped inside npm packages and discovered from `node_modules`. Libraries like `@tanstack/router-core` (10 skills) and `@trpc/server` (16 skills) already adopt this model. Intent uses a CLI to bridge packages to agent config files; our skills.sh bootstrap achieves the same result without requiring an extra tool.

All three arrive at the same conclusion: agent instructions belong in the package, versioned with the code.
