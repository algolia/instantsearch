# InstantSearch CLI

**TL;DR:** Adding InstantSearch to an existing app means figuring out the right packages, reading your index schema, and hand-wiring widget props — all mechanical work with a computable right answer. The InstantSearch CLI does it in two commands: `init` detects your framework and verifies credentials, `add search` introspects your Algolia index and generates fully-wired, schema-mapped components you own. It works for humans interactively and for AI agents via `--json --yes`. The CLI handles deterministic tasks (framework detection, index introspection, code generation); agents handle judgment calls (layout, styling, mounting). Every new InstantSearch feature becomes a single command or a single prompt.

## The problem

You're a developer. You've signed up for Algolia, indexed your data, and now you want to add search to your app. You open the InstantSearch docs and start piecing things together: which package matches your framework? Which import — `react-instantsearch`, `react-instantsearch-nextjs`, `instantsearch.js`? What props does `Hits` expect? What's the attribute name for your product title — was it `name`, `title`, `product_name`? Which attributes did you configure as facets three months ago? What are your replica indices called?

Every one of these questions has a right answer. It's sitting in your `package.json`, your `tsconfig.json`, and your Algolia index settings. But today, you have to look it up yourself and wire it by hand.

This is worse when an AI agent does it for you. An agent asked "add search to this app" will guess at imports and widget props. It has no way to introspect your Algolia index, so it hallucinates attribute names, picks the wrong package for your framework, and generates code that looks right but displays nothing. You debug, the agent tries again, and the loop repeats. The right answer was computable the whole time — the agent just had no tool to compute it.

The InstantSearch CLI fixes both problems at once.

## What it is

A command-line tool — `instantsearch` — that installs and pre-configures InstantSearch widgets into an existing project. Not a project scaffolder (that's `create-instantsearch-app`). Think of it as the bridge between "I have an app" and "I have a working search UI."

The CLI handles every decision that has a deterministic right answer: detecting your framework, picking the correct imports, introspecting your Algolia index for attributes and facets and replicas, and generating fully-wired widget components mapped to your actual data. It stays out of everything that's subjective: styling, layout, where to mount components in your app. Those decisions belong to the developer — or to the agent driving the tool.

Generated files are yours. No runtime dependency on the CLI, no proprietary wrapper layer. Plain components you own and edit, like shadcn/ui — except they come pre-wired to your index schema.

## How it works

Two commands. Here's a developer with an existing Next.js app adding product search against Algolia's e-commerce demo index.

**Step 1: Initialize the project**

```bash
npx instantsearch init
```

```
? Detected framework: Next.js App Router (react-instantsearch-nextjs + app/ directory). Correct? Yes
? Algolia Application ID: ABCDEF1234
? Algolia search-only API key: ••••••••••
? Components path: src/components
✔ Credentials verified
✔ Created instantsearch.json
✔ Created src/lib/algolia-client.ts
✔ Created src/lib/search.ts
```

The CLI reads `package.json` and `tsconfig.json`, detects the flavor (React), the framework (Next.js App Router), and that the project uses TypeScript. It verifies the Algolia credentials with a test call before writing anything. If something's off — wrong credentials, unsupported framework, ambiguous setup — it fails loudly with a clear message.

This runs once per project.

**Step 2: Add search**

```bash
npx instantsearch add search product-search
```

```
? Which index? instant_search
? Which attribute is the product title? name
? Which attribute is the image? image
? Which attribute is the description? description
? Which facet for filtering? brand
? Sort options (from replicas): instant_search_price_asc, instant_search_price_desc
✔ Created src/components/product-search/index.tsx
✔ Created src/components/product-search/Autocomplete.tsx
✔ Created src/components/product-search/Hits.tsx
✔ Created src/components/product-search/RefinementListBrand.tsx
✔ Created src/components/product-search/SortBy.tsx
✔ Created src/components/product-search/Pagination.tsx
✔ Created src/components/product-search/ClearRefinements.tsx

Next: import ProductSearch from '@/components/product-search' and render it where search should appear.
```

The CLI hits the Algolia index to discover what's there. It reads a record to find available attributes and image fields. It reads facet configuration to offer valid filter options. It reads replica settings to pre-fill sort options. If the search key doesn't have access to settings, it falls back to manual entry. If the index is empty, it warns you and lets you enter the schema by hand.

The result: a folder of typed, schema-mapped components ready to render. The developer's only remaining job is to place them in their layout.

Here's what the generated `Hits.tsx` looks like:

```tsx
import { Hits as InstantSearchHits } from 'react-instantsearch';

type ProductRecord = {
  name: string;
  image: string;
  description: string;
};

function Hit({ hit }: { hit: ProductRecord }) {
  return (
    <article>
      <img src={hit.image} alt={hit.name} />
      <h3>{hit.name}</h3>
      <p>{hit.description}</p>
    </article>
  );
}

export function Hits() {
  return <InstantSearchHits<ProductRecord> hitComponent={Hit} />;
}
```

No props to pass. No API to learn. The component knows its schema because the CLI read it from the index.

## Why each command exists

**`init`** runs once and handles project-level setup: credentials, framework detection, shared search client. It exists separately from `add` because credentials and detection are project-wide concerns, not per-feature concerns. Running them once avoids re-prompting and ensures consistency across features.

**`add search <name>`** installs a complete search experience — the opinionated bundle of widgets that Algolia knows work well together. It exists because most developers don't know which widgets they need; they know they want "a search page." The CLI encodes Algolia's opinion about what a good search page includes.

**`add <widget> <feature>`** adds a single widget to an existing feature — a second RefinementList on a different facet, a SortBy added after the fact. It exists because search UIs are iterative. Developers start with a template and customize from there.

This surface scales naturally. `add search` is the first template, but the same pattern extends to `add store-locator`, `add trending-items`, `add chat`. Each one is Algolia's opinion about what that experience includes, installed in one command.

## The agent multiplier

Every command accepts `--json` and `--yes` flags for fully non-interactive, machine-readable invocation. An AI agent can drive the CLI deterministically:

```bash
npx instantsearch add search product-search \
  --index instant_search \
  --hits-title name \
  --hits-image image \
  --refinement-list-attribute brand \
  --sort-by-replicas instant_search_price_asc,instant_search_price_desc \
  --yes --json
```

The JSON output includes every file created and explicit mounting instructions, so the agent knows exactly what to do next.

This is the key architectural insight: **the CLI is a determinism layer for agents.** It handles the parts that require ground truth — index schema, facet configuration, replica settings, correct framework imports — so the agent doesn't have to guess. The agent focuses on what it's good at: understanding the user's codebase, choosing where to mount components, applying styling, making layout decisions.

Paired with a lean InstantSearch skill, this gives an agent everything it needs to build Algolia interfaces correctly on the first try. The skill doesn't need to encode widget prop knowledge or index schema — the CLI handles that. The skill stays focused on judgment calls that no CLI can make. Less hallucination surface, better results, leaner maintenance.

Without the CLI, an agent has two options: guess (and get it wrong), or ask the user for every detail (and lose the magic). With the CLI, the agent calls a tool that returns correct, schema-mapped components — then improves on top.

## What it unlocks

The CLI reframes InstantSearch from a library you learn into a product you install.

Today, adopting a new InstantSearch feature means reading docs, understanding the API, and wiring props. The CLI collapses that to a single command. This has compounding effects:

**Every new feature ships with a built-in adoption path.** When we release a new widget or a new product surface, we add it to the CLI's registry. Developers adopt it with `add <feature>`. Agents adopt it with a flag. No docs-reading required. The time between "we shipped it" and "a customer is using it" drops to minutes.

**The CLI lives in the InstantSearch monorepo.** This means we can enforce in CI that no new widget or prop ships without CLI support. The CLI can't drift from the library because they're tested together. This is a maintenance guarantee you can't get with an external tool.

**Framework support scales.** The CLI's detection and generation layers are separated. Adding Vue, Astro, or any new framework means adding a detector and a generator — the introspection, manifest, and command surface stay the same. Each new framework unlocks the CLI for a new customer segment.

## See it in action

A recorded demo of the full flow — from `init` to a working search page — accompanies this document. [Link to demo]

To try the POC locally against your own project:

```bash
# Check out the POC branch
gh pr checkout 7009

# From the instantsearch monorepo, link the CLI globally
cd packages/instantsearch-cli
yarn link

# In your project directory, install the skill and run the CLI
cd ~/your-project
mkdir -p .claude/skills/add-search && cp ~/Projects/instantsearch/packages/instantsearch-cli/skill/SKILL.md .claude/skills/add-search/SKILL.md
instantsearch init
instantsearch add search product-search
```

The POC supports React (plain + Next.js App Router) and vanilla JS (`instantsearch.js`) with TypeScript and plain JavaScript output. The command surface shown in this document reflects the target design; the POC demonstrates the core flow with minor command differences.

## API reference

### `instantsearch init`

Initialize InstantSearch in the current project. Detects framework and TypeScript, verifies Algolia credentials, writes the root manifest and shared search client.

| Flag | Description |
|---|---|
| `--flavor <react\|js>` | Override detected flavor |
| `--framework <nextjs>` | Override detected framework (omit for plain React or JS) |
| `--app-id <id>` | Algolia application ID |
| `--search-api-key <key>` | Algolia search-only API key |
| `--components-path <path>` | Where generated components live (default: `src/components`) |
| `--yes` | Accept defaults without prompting |
| `--json` | Emit structured JSON output (implies `--yes`) |

### `instantsearch add <item> [target]`

Add a composite feature or a single widget.

- **Composite feature**: `instantsearch add search product-search` — installs a complete search experience named `product-search`.
- **Single widget**: `instantsearch add refinement-list product-search` — adds a RefinementList to the existing `product-search` feature. If the feature doesn't exist, it's created inline.

| Flag | Description |
|---|---|
| `--index <name>` | Algolia index name |
| `--hits-title <attr>` | Record attribute to display as the hit title |
| `--hits-image <attr>` | Record attribute containing an image URL |
| `--hits-description <attr>` | Record attribute to display as the hit description |
| `--refinement-list-attribute <attr>` | Facet attribute for filtering |
| `--sort-by-replicas <a,b,c>` | Comma-separated replica index names |
| `--yes` | Accept defaults without prompting |
| `--json` | Emit structured JSON output (implies `--yes`) |

### `instantsearch introspect`

Introspect an Algolia index to discover available attributes, facets, and replicas. Useful for exploring an index before adding widgets.

| Flag | Description |
|---|---|
| `--index <name>` | Algolia index name (required) |
| `--app-id <id>` | Algolia application ID (overrides `instantsearch.json`) |
| `--search-api-key <key>` | Algolia search-only API key (overrides `instantsearch.json`) |
| `--yes` | Accept defaults without prompting |
| `--json` | Emit structured JSON output (implies `--yes`) |

### Global behavior

- `--json` implies `--yes`. Missing required inputs produce `{ ok: false, code: "...", message: "..." }` with a non-zero exit code.
- Success payloads include `apiVersion`, `filesCreated`, and `nextSteps` (imports + mounting guidance).
- Every interactive prompt has a corresponding flag, so `--yes --json` runs are fully deterministic.

## FAQ

### Why not add this to the Algolia CLI?

The Algolia CLI is a Homebrew package written in Go, maintained in a separate repository, and not published to npm. This creates three problems: (1) users can't `npx` it — they have to install it, which is friction we're trying to eliminate; (2) it's easy for the CLI to drift when InstantSearch ships a new widget or API, since they're in different repos with different release cycles; (3) we're not the owners, so we can't enforce that InstantSearch changes are reflected in the CLI.

By living in the InstantSearch monorepo, the CLI is tested alongside the library. We can add CI steps to ensure we never ship a new widget without CLI support. Same repo, same release, no drift.

### Why not just build a skill for AI agents?

A skill is the wrong tool for deterministic work. Index introspection, framework detection, and code generation based on schema are mechanical tasks with correct answers — they don't need an LLM's judgment, they need a reliable tool. Encoding all of this as skill instructions means more room for hallucinations, more tokens spent, and prose that's harder to maintain than code.

The right split: the CLI handles deterministic tasks cheaply and reliably, the skill handles judgment calls (layout, styling, mounting decisions) that no CLI can make. Together, they give the agent complete coverage with minimal hallucination surface.

### Why not improve create-instantsearch-app?

`create-instantsearch-app` scaffolds new projects from scratch. Most developers don't need a new project — they have an existing app and want to add search to it. The CLI addresses this common case. It's a new direction for the same goal: making InstantSearch adoption effortless.

### Is this a shadcn clone?

Same philosophy — generated files you own, no runtime dependency on the CLI — but different in two important ways. First, the CLI introspects your live Algolia index to pre-wire components to your actual data schema. Second, it supports fully non-interactive invocation (`--json --yes`) designed for AI agents to drive programmatically. It's shadcn's ownership model applied to a data-connected search UI.

### Why invest in a CLI when the industry is moving to AI-first workflows?

The CLI *is* the AI-first play. An agent without the CLI guesses at your index schema and framework setup. An agent with the CLI calls a tool that returns correct, schema-mapped components — then focuses its intelligence on the parts that actually need it. The CLI makes agents better at building with Algolia, which makes Algolia the easiest search provider to adopt in an agent-driven world.
