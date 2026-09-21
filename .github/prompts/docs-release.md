You are doing a final documentation sweep for an InstantSearch release.

This is a non-interactive automated workflow. Do not ask for input. Your working
directory is the Algolia docs repository, so its `AGENTS.md` and `style-guide.md`
are already loaded into your context - follow them; they take precedence over
anything here about tone, components, or file layout.

## What this pass is for

Each user-facing change in this release should already have been documented when
its pull request merged, and those edits are on the branch you are standing on.
You are the safety net: find what the per-change runs missed, and nothing more.

The context at the end of this prompt has the release changelogs and a summary of
what the branch already changed. Compare them.

## Task

1. Read the release context. For each user-facing entry in the changelogs, check
   whether the branch already covers it - use `git diff` against the default
   branch, and search the docs for the relevant prop, hook, or widget name.

2. List the genuinely uncovered items in `PROGRESS.md` before editing anything.
   An entry that is already documented, or that is not user-facing (internal
   refactors, tests, build changes, bug fixes restoring documented behavior),
   is not an item.

3. Document the uncovered items, verifying every prop name, default and
   signature against the InstantSearch source before writing it.

4. Do a coherence check on the accumulated diff: no duplicated sections, no
   contradictory statements between flavors, no page that documents a prop the
   others are missing.

5. Check the guides for the cycle as a whole. This is the one thing only you can
   do: each per-change run saw a single diff, so none of them could tell that
   three separate changes have collectively made a guide's walkthrough wrong.
   Using the affected-pages list at the end of the context, read the guides that
   cover the areas this release touched and ask whether they still describe the
   product.

   If the release's features together justify a guide that no single change
   justified alone, **propose it** under a `Flagged for humans` heading in
   `CHANGES_SUMMARY.md` rather than writing it. A new guide drafted unattended at
   release time is the worst moment for one; a paragraph naming the gap is
   genuinely useful. The same goes for restructuring an existing guide - propose,
   never do it here.

If nothing is uncovered and the diff is coherent, write
`No documentation changes needed` as the first line of `CHANGES_SUMMARY.md`, set
`STATUS: DONE`, and stop. That is a successful run.

Do not commit or push. CI does that.

## Progress file (REQUIRED)

Write `PROGRESS.md` to the scratch directory before your first edit:

```
STATUS: IN_PROGRESS

## Uncovered items
- [ ] `initialMessage` on the chat trigger - no mention on any flavor page
- [ ] welcome-screen guide still says the greeting cannot be dismissed

## Already covered (checked)
- consolidated `context` object - documented in the react and js chat pages

## Flagged for humans
- the chat-customization guides now overlap; worth restructuring, not by me

## Notes for the next pass
- ...
```

Set the first line to `STATUS: DONE` only when the sweep is finished.

## Summary file (REQUIRED)

Maintain `CHANGES_SUMMARY.md` in the scratch directory, appending as you go. Its
first line becomes the pull request title for the whole release, so it must
follow this repository's convention in `AGENTS.md`: `feat` if the release adds
new pages, otherwise `fix`; sentence case, imperative, no trailing period, under
70 characters, and never `docs:`. Then a blank line, then a markdown list of
everything on the branch - including work done by the per-change runs, which you
can read from the existing `CHANGES_SUMMARY.md` and the diff.

```
feat(ui-libraries): document the InstantSearch chat additions

- Added `initialMessage` to the chat trigger reference for js, react and vue
- Documented the consolidated `context` object for overridable components
```

## Where pages live

The flavor is the **file name**, not a suffix. Each topic is a directory with
one page per flavor:

- `doc/api-reference/widgets/<widget>/{js,react,vue}.mdx` - reference
- `doc/guides/building-search-ui/**/{js,react,vue}.mdx` - guides

There are no `*.js.mdx` files in this repository. Navigation entries in
`docs.json` and `config/tab-*.json` are the path without the extension, with a
leading slash: `/doc/api-reference/widgets/chat/js`. Register new pages next to
their siblings and run `npm run generate:flavors` after adding flavor variants.

Pages for other platforms (`android.mdx`, `ios.mdx`, `flutter.mdx`, ...) are not
yours. Leave them alone even when they share a widget name.

## Cross-flavor consistency (the trap in this repo)

A feature usually appears in only ONE package's changelog even when it reaches
every flavor. Changelogs are generated per package from the files each commit
touched (Lerna independent versioning), so a feature added to a shared connector
or core package - a `feat(chat)` that only edits
`packages/instantsearch.js/src/connectors/...` - is invisible in the
react-instantsearch and vue-instantsearch changelogs. That absence is NOT
evidence the feature is JS-only.

How shared options propagate. Verify in SOURCE, never infer from the changelog:

- Connector options: the params type (e.g. `ChatConnectorParams`) is defined in
  instantsearch.js / instantsearch-core and IMPORTED by the matching
  react-instantsearch-core `use*` hook - `useChat` imports `ChatConnectorParams`
  from `instantsearch.js/es/connectors/chat/connectChat`. The React widget then
  spreads `...props` into that hook, so the option works in React even though it
  is never re-declared or changelogged there. Vue wraps the same connectors.
- UI and rendering features are shared via `instantsearch-ui-components`.

To decide whether React or Vue support a new option, TRACE THE TYPE: does that
flavor's `use*` hook import the connector params, and does the component spread
`...props`? If yes, the option is supported and must be documented for that
flavor. Do not conclude a flavor lacks an option just because that flavor's own
source never names it.
