# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.0](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.2.2...instantsearch-codemods@1.0.0-beta.0) (2026-11-19)


### Bug Fixes

* **codemods:** update is-v4-to-v5 to the single root entry [FX-4167] ([#7431](https://github.com/algolia/instantsearch/issues/7431)) ([6fa4e0b](https://github.com/algolia/instantsearch/commit/6fa4e0ba78ffd06ea3b56b88d62f668452d303ea))


* feat(vue)!: promote experimental autocomplete to AisAutocomplete (#7418) ([3a2351a](https://github.com/algolia/instantsearch/commit/3a2351a7c548e4ad3efe3a8f2e0b47ee527af9c7)), closes [#7418](https://github.com/algolia/instantsearch/issues/7418)
* refactor(hits,infinite-hits)!: remove the deprecated __hitIndex (#7419) ([f9b890d](https://github.com/algolia/instantsearch/commit/f9b890d212d5ae6c5cedd1463e1d102adb188055)), closes [#7419](https://github.com/algolia/instantsearch/issues/7419) [#5495](https://github.com/algolia/instantsearch/issues/5495)


### Features

* **codemods:** add is-v4-to-v5 ([#7386](https://github.com/algolia/instantsearch/issues/7386)) ([84724ed](https://github.com/algolia/instantsearch/commit/84724ed790fa4eda87cc631f6f48f2d265fdb8fc))


### BREAKING CHANGES

* `AisExperimentalAutocomplete` (`<ais-experimental-autocomplete>`) is now `AisAutocomplete` (`<ais-autocomplete>`). The previous renderless `AisAutocomplete` (slot wrapper around `connectAutocomplete`) is removed; build it with `connectAutocomplete` and `createWidgetMixin` if needed. The `is-v4-to-v5` codemod renames the identifier and flags imports of the old component.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

* fix(codemods): avoid duplicate AisAutocomplete binding in is-v4-to-v5

When a file imports both the old `AisAutocomplete` and `AisExperimentalAutocomplete`, alias the latter's import (`AisAutocomplete as AisExperimentalAutocomplete`) instead of renaming it, so there is no duplicate binding.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
* the `item` template of `hits` and `infiniteHits` no
longer receives `__hitIndex`. Use `__position`, the position of the hit
across pages, starting at 1.

Co-authored-by: Cursor <cursoragent@cursor.com>

* feat(codemods): rewrite __hitIndex to __position - 1

Instead of leaving a TODO, the is-v4-to-v5 codemod now rewrites
`hit.__hitIndex` to `hit.__position - 1`, and `hit.__hitIndex + 1` to
`hit.__position`. `__position` starts at 1 and counts across pages, so
the values match on the first page of `hits`, and in `infiniteHits`
lists that start at the first page.

Where `__hitIndex` can't be rewritten in place, like when it is
destructured, the codemod still leaves a TODO, which now says
`__position - 1`.

Co-authored-by: Cursor <cursoragent@cursor.com>

* test(hits,infinite-hits): drop the tests checking for no __hitIndex

They only checked that the item templates don't get `__hitIndex`
anymore. `__position` stays covered by the insights payload
expectations of both widgets.

Co-authored-by: Cursor <cursoragent@cursor.com>

* fix(codemods): rewrite bracket access to __hitIndex too

`hit['__hitIndex']` was neither rewritten nor flagged with a TODO. It is
now rewritten like `hit.__hitIndex`, to `hit['__position'] - 1`.

Co-authored-by: Cursor <cursoragent@cursor.com>

* docs(codemods): mention transformItems in the __hitIndex caveat

`__position` is set before `transformItems` runs, so `__position - 1`
also differs from the old `__hitIndex` when `transformItems` filters or
reorders the hits, not only after the first page of `hits`.

Co-authored-by: Cursor <cursoragent@cursor.com>

* fix(codemods): leave optional __hitIndex accesses as TODOs

Rewriting `hit?.__hitIndex` to `hit?.__position - 1` turned a missing
hit into `NaN`, so a fallback like `hit?.__hitIndex ?? 0` stopped
working. Accesses in an optional chain, including `hit?.['__hitIndex']`,
now get the TODO comment instead.

Co-authored-by: Cursor <cursoragent@cursor.com>





## [0.2.2](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.2.1...instantsearch-codemods@0.2.2) (2026-08-06)

**Note:** Version bump only for package instantsearch-codemods





# [0.2.0](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.1.5...instantsearch-codemods@0.2.0) (2026-02-25)


### Features

* **build:** unify build system across monorepo ([#6886](https://github.com/algolia/instantsearch/issues/6886)) ([e8b2ef7](https://github.com/algolia/instantsearch/commit/e8b2ef7dc1b7d98f1ee5518fad7607b5f31bbd96))





## [0.1.5](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.1.4...instantsearch-codemods@0.1.5) (2025-12-31)


### Bug Fixes

* **dependencies:** remove qs limitation ([#6850](https://github.com/algolia/instantsearch/issues/6850)) ([ca86687](https://github.com/algolia/instantsearch/commit/ca866878fb532f8f0667126b1c052b1fb1a7ff55)), closes [#6849](https://github.com/algolia/instantsearch/issues/6849)





## [0.1.4](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.1.3...instantsearch-codemods@0.1.4) (2023-10-24)

**Note:** Version bump only for package instantsearch-codemods





## [0.1.3](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.1.2...instantsearch-codemods@0.1.3) (2023-09-19)


### Bug Fixes

* **prettier:** consistent version ([#5850](https://github.com/algolia/instantsearch/issues/5850)) ([ca59c6d](https://github.com/algolia/instantsearch/commit/ca59c6dbd5c9eac4e2e0179a24e39bca997ae141))





## [0.1.2](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.1.1...instantsearch-codemods@0.1.2) (2023-08-15)


### Bug Fixes

* **use:** compatibility for modern babel ([#5807](https://github.com/algolia/instantsearch/issues/5807)) ([c4f9eeb](https://github.com/algolia/instantsearch/commit/c4f9eeb49dffb9caa12acef7ffa895e30d7f06fa))





## [0.1.1](https://github.com/algolia/instantsearch/compare/instantsearch-codemods@0.1.0...instantsearch-codemods@0.1.1) (2023-08-08)


### Bug Fixes

* **codemods:** add empty transforms object so that script does not fail ([#5802](https://github.com/algolia/instantsearch/issues/5802)) ([9b05a72](https://github.com/algolia/instantsearch/commit/9b05a726c263aadf35b5a6bd5eb0cf4212496052))





# 0.1.0 (2023-08-07)


### Features

* add more info to instantsearch-codemods `package.json` ([#5800](https://github.com/algolia/instantsearch/issues/5800)) ([279a70e](https://github.com/algolia/instantsearch/commit/279a70e1358c681b862836e2549b332230d67805))
* **getServerState:** require `renderToString` ([#5786](https://github.com/algolia/instantsearch/issues/5786)) ([f9762ce](https://github.com/algolia/instantsearch/commit/f9762ce3e78e246e2633fd29bde9ec57980d7a02))
* **react-instantsearch:** provide codemods to help with migration ([#5771](https://github.com/algolia/instantsearch/issues/5771)) ([4db165e](https://github.com/algolia/instantsearch/commit/4db165e77b73714dc206e6e88cec848136f1e32f))
