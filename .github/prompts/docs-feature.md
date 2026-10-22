You are documenting a single change that just landed in InstantSearch.

This is a non-interactive automated workflow. Do not ask for input. Your working
directory is the Algolia docs repository, so its `AGENTS.md` and `style-guide.md`
are already loaded into your context - follow them; they take precedence over
anything here about tone, components, or file layout.

## The most likely correct outcome is "nothing"

Most merged commits need no documentation. Internal refactors, test changes,
build fixes, performance work, and bug fixes that restore documented behavior
are all invisible to readers. Documenting them adds noise.

Only write documentation when the change alters what a user can **do** or
**see**: a new widget, hook, connector option, prop, CSS class, event, or a
behavior change that contradicts what a page currently says.

"Not worth a reference change" is not the same as "not worth a guide change".
A behavior fix can leave a guide describing something that no longer happens
while adding nothing to any reference table - check before concluding nothing.

If there is nothing to document, write `No documentation changes needed` as the
first line of `CHANGES_SUMMARY.md`, set `STATUS: DONE` in `PROGRESS.md`, make no
edits, and stop. That is a successful run.

## Task

1. Read the change context at the end of this prompt: the commit, the pull
   request description, and the source files it touched.

2. Decide whether it is user-facing. If not, stop as described above.

3. If it is, verify the actual API in the InstantSearch source before writing a
   word. Read the type, the connector, and the widget. Never document a prop
   name, default, or signature you have not seen in the source.

4. Work through the affected-pages list at the end of the context, reference
   and guides alike. See below - this is the part most likely to be skimped.

5. Make the edits, for every affected flavor. Batch the edits per file rather
   than making many small sequential ones.

6. Keep `PROGRESS.md` and `CHANGES_SUMMARY.md` in the scratch directory current.

Do not commit or push. CI does that.

## Progress file (REQUIRED)

Write `PROGRESS.md` to the scratch directory before your first edit:

```
STATUS: IN_PROGRESS

## Plan
- [ ] Document `initialMessage` on the chat trigger (js, react, vue)

## Notes for the next pass
- The react page sorts its prop table alphabetically.
```

Set the first line to `STATUS: DONE` only when the whole task is finished. The
workflow reads that line to decide whether this run is complete or partial.

## Summary file (REQUIRED)

Maintain `CHANGES_SUMMARY.md` in the scratch directory, appending as you go so a
partial run still has one. First line is a pull-request title following this
repository's convention in `AGENTS.md` - `feat` for new pages or newly
documented features, `fix` for updates to existing pages, sentence case,
imperative, no trailing period, under 70 characters, and never `docs:`. Then a
blank line, then a markdown list of what changed.

```
feat(ui-libraries): document the chat trigger initial message

- Added `initialMessage` to the chat trigger reference for js, react and vue
- Added an example of opening the chat with a prefilled message
```

## Where pages live

The flavor is the **file name**, not a suffix. Each topic is a directory with
one page per flavor:

- `doc/api-reference/widgets/<widget>/{js,react,vue}.mdx` - reference
- `doc/guides/building-search-ui/**/{js,react,vue}.mdx` - guides

There are no `*.js.mdx` files in this repository. Navigation entries in
`docs.json` and `config/tab-*.json` are the path without the extension, with a
leading slash: `/doc/api-reference/widgets/chat/js`. A page that is not listed
there is unreachable, so register new ones next to their siblings and run
`npm run generate:flavors` after adding flavor variants.

Pages for other platforms (`android.mdx`, `ios.mdx`, `flutter.mdx`, ...) are not
yours. Leave them alone even when they share a widget name.

## Reference is half the job; guides are the half that rots

A new option means a new row in a reference table, which is mechanical. The
failure mode that actually costs readers is a guide that walks through a flow
you have just changed and still describes the old one - plausible, confident and
wrong. Nobody notices, because nothing is missing.

The context ends with a list of existing pages that mention the names this
change touches, most relevant first. Work through it:

- For each **reference** page, is anything now incomplete or inexact?
- For each **guide**, does it still describe what the product does? Read the
  prose, not only the code samples - a sample that still compiles next to a
  sentence that is now false is the common case. A guide dedicated to the
  feature you changed is the most likely casualty.

Leave a page alone if the change does not touch what it says. Editing pages that
did not need it is what makes these pull requests unreviewable.

### When a new guide is warranted

Rarely. The bar is a new widget, or a capability that needs multi-step setup and
has nowhere sensible to live in an existing guide. A new option almost never
clears it - extend the guide that already covers the area instead.

Two hard limits:

- **Do not restructure, split or reorganise existing guides.** The blast radius
  is too large for an automated per-change edit. If you believe a guide needs
  it, write that under a `Flagged for humans` heading in `CHANGES_SUMMARY.md`
  and change nothing.
- If you do create a new page, make it the **first** bullet in
  `CHANGES_SUMMARY.md` so reviewers know a whole page appeared, and register it
  in the navigation.

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
