# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.4.0](https://github.com/algolia/instantsearch/compare/@instantsearch/e2e-tests@4.0.0...@instantsearch/e2e-tests@4.4.0) (2024-02-27)


### Bug Fixes

* **prettier:** consistent version ([#5850](https://github.com/algolia/instantsearch/issues/5850)) ([ca59c6d](https://github.com/algolia/instantsearch/commit/ca59c6dbd5c9eac4e2e0179a24e39bca997ae141))
* **this:** ensure all functions are able to be destructured ([#5611](https://github.com/algolia/instantsearch/issues/5611)) ([a8b5c1e](https://github.com/algolia/instantsearch/commit/a8b5c1e5bbd6afac39fce523f7d7c2ec02f51153)), closes [#5589](https://github.com/algolia/instantsearch/issues/5589)


### Features

* rename packages ([#5787](https://github.com/algolia/instantsearch/issues/5787)) ([c133170](https://github.com/algolia/instantsearch/commit/c133170e563592dfc15a95daced1f8447327a09a))





# [4.3.0](https://github.com/algolia/instantsearch/compare/@instantsearch/e2e-tests@4.0.0...@instantsearch/e2e-tests@4.3.0) (2023-09-19)


### Bug Fixes

* **prettier:** consistent version ([#5850](https://github.com/algolia/instantsearch/issues/5850)) ([ca59c6d](https://github.com/algolia/instantsearch/commit/ca59c6dbd5c9eac4e2e0179a24e39bca997ae141))
* **this:** ensure all functions are able to be destructured ([#5611](https://github.com/algolia/instantsearch/issues/5611)) ([a8b5c1e](https://github.com/algolia/instantsearch/commit/a8b5c1e5bbd6afac39fce523f7d7c2ec02f51153)), closes [#5589](https://github.com/algolia/instantsearch/issues/5589)


### Features

* rename packages ([#5787](https://github.com/algolia/instantsearch/issues/5787)) ([c133170](https://github.com/algolia/instantsearch/commit/c133170e563592dfc15a95daced1f8447327a09a))





# [4.2.0](https://github.com/algolia/instantsearch/compare/@instantsearch/e2e-tests@4.0.0...@instantsearch/e2e-tests@4.2.0) (2023-08-15)

### Bug Fixes

- **this:** ensure all functions are able to be destructured ([#5611](https://github.com/algolia/instantsearch/issues/5611)) ([a8b5c1e](https://github.com/algolia/instantsearch/commit/a8b5c1e5bbd6afac39fce523f7d7c2ec02f51153)), closes [#5589](https://github.com/algolia/instantsearch/issues/5589)

### Features

- rename packages ([#5787](https://github.com/algolia/instantsearch/issues/5787)) ([c133170](https://github.com/algolia/instantsearch/commit/c133170e563592dfc15a95daced1f8447327a09a))

## [4.0.3](https://github.com/algolia/instantsearch/compare/@instantsearch/e2e-tests@4.0.0...@instantsearch/e2e-tests@4.0.3) (2023-07-25)

### Bug Fixes

- **this:** ensure all functions are able to be destructured ([#5611](https://github.com/algolia/instantsearch/issues/5611)) ([a8b5c1e](https://github.com/algolia/instantsearch/commit/a8b5c1e5bbd6afac39fce523f7d7c2ec02f51153)), closes [#5589](https://github.com/algolia/instantsearch/issues/5589)

## [4.0.2](https://github.com/algolia/instantsearch/compare/@instantsearch/e2e-tests@4.0.0...@instantsearch/e2e-tests@4.0.2) (2023-05-16)

### Bug Fixes

- **this:** ensure all functions are able to be destructured ([#5611](https://github.com/algolia/instantsearch/issues/5611)) ([a8b5c1e](https://github.com/algolia/instantsearch/commit/a8b5c1e5bbd6afac39fce523f7d7c2ec02f51153)), closes [#5589](https://github.com/algolia/instantsearch/issues/5589)

## [4.0.1](https://github.com/algolia/instantsearch/compare/@instantsearch/e2e-tests@4.0.0...@instantsearch/e2e-tests@4.0.1) (2023-01-03)

**Note:** Version bump only for package @instantsearch/e2e-tests

# 4.0.0 (2022-12-13)

### BREAKING CHANGES

- **tests:** this requires the url to be /examples/js/e-commerce instead of /examples/e-commerce. This means that until the package is in the monorepo, its tests wouldn't pass. After the main monorepo PR is merged, this repo will move inside and will no longer be published.
- tested projects now require `@wdio/junit-reporter`.

## [3.0.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v2.0.1...v2.0.2) (2022-11-23)

### Features

- **tests:** migrate to the InstantSearch monorepo ([#38](https://github.com/algolia/instantsearch-e2e-tests/issues/38))

## [2.0.2](https://github.com/algolia/instantsearch-e2e-tests/compare/v2.0.1...v2.0.2) (2022-02-03)

### Bug Fixes

- **spec:** reduce flakiness related to range slider manipulation ([#33](https://github.com/algolia/instantsearch-e2e-tests/issues/33)) ([a008f38](https://github.com/algolia/instantsearch-e2e-tests/commit/a008f38))

## [2.0.1](https://github.com/algolia/instantsearch-e2e-tests/compare/v2.0.0...v2.0.1) (2022-01-18)

### Bug Fixes

- correctly output junit report in target repository ([#32](https://github.com/algolia/instantsearch-e2e-tests/issues/32)) ([d3e9e1b](https://github.com/algolia/instantsearch-e2e-tests/commit/d3e9e1b))

# [2.0.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.3.0...v2.0.0) (2022-01-17)

### Features

- generate junit test reports by default with saucelabs ([#29](https://github.com/algolia/instantsearch-e2e-tests/issues/29)) ([5f2c0b3](https://github.com/algolia/instantsearch-e2e-tests/commit/5f2c0b3))

### BREAKING CHANGES

- tested projects now require `@wdio/junit-reporter`.

# [1.3.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.4...v1.3.0) (2020-04-17)

### Bug Fixes

- **spec:** improve specs reliability to minimize flackyness ([#21](https://github.com/algolia/instantsearch-e2e-tests/issues/21)) ([44bae68](https://github.com/algolia/instantsearch-e2e-tests/commit/44bae68))
- **test:** change InstantSearch.js test branch to `master` ([#19](https://github.com/algolia/instantsearch-e2e-tests/issues/19)) ([1c34d8d](https://github.com/algolia/instantsearch-e2e-tests/commit/1c34d8d))

### Features

- **spec:** add custom error messages for timeouts ([#18](https://github.com/algolia/instantsearch-e2e-tests/issues/18)) ([617a22d](https://github.com/algolia/instantsearch-e2e-tests/commit/617a22d))
- **webdriverio:** add retry for Sauce Connect tunnel ([#17](https://github.com/algolia/instantsearch-e2e-tests/issues/17)) ([9e398c2](https://github.com/algolia/instantsearch-e2e-tests/commit/9e398c2))

## [1.2.4](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.3...v1.2.4) (2019-11-26)

### Bug Fixes

- **setSearchBoxValue:** reset searchbox before editing ([#15](https://github.com/algolia/instantsearch-e2e-tests/issues/15)) ([b52ea34](https://github.com/algolia/instantsearch-e2e-tests/commit/b52ea3468594c86168b155bb0fcab1230ff86672)), closes [/app.saucelabs.com/tests/4518f96fdfd447e998786d0ff463658a#54](https://github.com//app.saucelabs.com/tests/4518f96fdfd447e998786d0ff463658a/issues/54)

## [1.2.3](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.2...v1.2.3) (2019-10-14)

### Bug Fixes

- **helper:** fix helpers to handle RangeSlider in vue-instantsearch ([#12](https://github.com/algolia/instantsearch-e2e-tests/issues/12)) ([143a59b](https://github.com/algolia/instantsearch-e2e-tests/commit/143a59b))

## [1.2.2](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.1...v1.2.2) (2019-09-12)

### Bug Fixes

- **spec:** fix specs to match fixed slider behavior ([#10](https://github.com/algolia/instantsearch-e2e-tests/issues/10)) ([d7bce97](https://github.com/algolia/instantsearch-e2e-tests/commit/d7bce97))

## [1.2.1](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.0...v1.2.1) (2019-09-11)

### Bug Fixes

- **helper:** fix helpers to handle RangeSlider in react-instantsearch ([#9](https://github.com/algolia/instantsearch-e2e-tests/issues/9)) ([c2de700](https://github.com/algolia/instantsearch-e2e-tests/commit/c2de700))

# [1.2.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.1.0...v1.2.0) (2019-09-06)

### Bug Fixes

- **helper:** fix getSelectedHierarchicalMenuItems to wait for the elements ([5a2456b](https://github.com/algolia/instantsearch-e2e-tests/commit/5a2456b))
- **helper:** fix getTextFromElements helper to use getText selector ([272a7ec](https://github.com/algolia/instantsearch-e2e-tests/commit/272a7ec))
- **helper:** fix helpers to scroll to elements before attempting to click on it ([#6](https://github.com/algolia/instantsearch-e2e-tests/issues/6)) ([cd87be6](https://github.com/algolia/instantsearch-e2e-tests/commit/cd87be6))
- **helper:** fix dragRangeSliderLowerBoundTo offset calculation ([#7](https://github.com/algolia/instantsearch-e2e-tests/issues/7)) ([3291000](https://github.com/algolia/instantsearch-e2e-tests/commit/3291000))
- **spec:** fix price-range spec to match new slider behavior ([#8](https://github.com/algolia/instantsearch-e2e-tests/issues/8)) ([7a566d5](https://github.com/algolia/instantsearch-e2e-tests/commit/7a566d5))
- **webdriverio:** fix mount paths for static server so rewritten urls works ([2f9490e](https://github.com/algolia/instantsearch-e2e-tests/commit/2f9490e))

### Features

- **helper:** add clickToggleRefinement helper ([fa0a0bb](https://github.com/algolia/instantsearch-e2e-tests/commit/fa0a0bb))
- **helper:** add clickClearRefinements helper ([4c996b0](https://github.com/algolia/instantsearch-e2e-tests/commit/4c996b0))
- **helper:** add getHitsPerPage helper ([28a6d5f](https://github.com/algolia/instantsearch-e2e-tests/commit/28a6d5f))
- **helper:** add getHitsTitles helper ([9da7cd9](https://github.com/algolia/instantsearch-e2e-tests/commit/9da7cd9))
- **helper:** add getCurrentPage helper ([d1e79fc](https://github.com/algolia/instantsearch-e2e-tests/commit/d1e79fc))
- **helper:** add getRangeSliderLowerBoundValue helper ([cc30634](https://github.com/algolia/instantsearch-e2e-tests/commit/cc30634))
- **helper:** add getRangeSliderUpperBoundValue helper ([99c336b](https://github.com/algolia/instantsearch-e2e-tests/commit/99c336b))
- **helper:** add getSelectedRatingMenuItem helper ([1d1dcc6](https://github.com/algolia/instantsearch-e2e-tests/commit/1d1dcc6))
- **helper:** add getSearchBoxValue helper ([cfd44fb](https://github.com/algolia/instantsearch-e2e-tests/commit/cfd44fb))
- **helper:** add getSelectedHierarchicalMenuItems helper ([90e0e1c](https://github.com/algolia/instantsearch-e2e-tests/commit/90e0e1c))
- **helper:** add getSelectedRefinementListItem helper ([278babd](https://github.com/algolia/instantsearch-e2e-tests/commit/278babd))
- **helper:** add getSortByValue helper ([c71da3c](https://github.com/algolia/instantsearch-e2e-tests/commit/c71da3c))
- **helper:** add getToggleRefinementStatus helper ([3c8d36d](https://github.com/algolia/instantsearch-e2e-tests/commit/3c8d36d))
- **helper:** add setHitsPerPage helper ([6f12380](https://github.com/algolia/instantsearch-e2e-tests/commit/6f12380))
- **helper:** add clickNextPage helper ([6838b66](https://github.com/algolia/instantsearch-e2e-tests/commit/6838b66))
- **helper:** add clickPage helper ([77b3299](https://github.com/algolia/instantsearch-e2e-tests/commit/77b3299))
- **helper:** add clickPreviousPage helper ([53eda61](https://github.com/algolia/instantsearch-e2e-tests/commit/53eda61))
- **helper:** add dragRangeSliderLowerBoundTo helper ([21534d1](https://github.com/algolia/instantsearch-e2e-tests/commit/21534d1))
- **helper:** add dragRangeSliderUpperBoundTo helper ([a165c05](https://github.com/algolia/instantsearch-e2e-tests/commit/a165c05))
- **helper:** add clickRatingMenuItem helper ([ce36250](https://github.com/algolia/instantsearch-e2e-tests/commit/ce36250))
- **helper:** add setSearchBoxValue helper ([5897191](https://github.com/algolia/instantsearch-e2e-tests/commit/5897191))
- **helper:** add clickHierarchicalMenuItem helper ([6c4b3e2](https://github.com/algolia/instantsearch-e2e-tests/commit/6c4b3e2))
- **helper:** add clickRefinementListItem helper ([8fe93f2](https://github.com/algolia/instantsearch-e2e-tests/commit/8fe93f2))
- **helper:** add setSortByValue helper ([57fc5d4](https://github.com/algolia/instantsearch-e2e-tests/commit/57fc5d4))
- **helper:** add waitForElement helper ([b33b28b](https://github.com/algolia/instantsearch-e2e-tests/commit/b33b28b))
- **spec:** add spec for initializing the state from the route ([#4](https://github.com/algolia/instantsearch-e2e-tests/issues/4)) ([f92238e](https://github.com/algolia/instantsearch-e2e-tests/commit/f92238e))
- **spec:** add spec for pagination ([#2](https://github.com/algolia/instantsearch-e2e-tests/issues/2)) ([a75e917](https://github.com/algolia/instantsearch-e2e-tests/commit/a75e917))
- **spec:** add spec for search on specific category ([#3](https://github.com/algolia/instantsearch-e2e-tests/issues/3)) ([cdd9247](https://github.com/algolia/instantsearch-e2e-tests/commit/cdd9247))

# [1.1.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.0.0...v1.1.0) (2019-08-19)

### Bug Fixes

- **helper:** fix dragAndDropByOffset helper Internet Explorer 11 compatibility ([393f27a](https://github.com/algolia/instantsearch-e2e-tests/commit/393f27a))
- **spec:** fix Internet Explorer 11 compatibility for test on brand and query filtering ([57a0ece](https://github.com/algolia/instantsearch-e2e-tests/commit/57a0ece))
- **spec:** wait for the browser to be maximized before running the test on brand an query filtering ([5db981e](https://github.com/algolia/instantsearch-e2e-tests/commit/5db981e))

### Features

- **helper:** add getTextFromElements helper ([5c4ec78](https://github.com/algolia/instantsearch-e2e-tests/commit/5c4ec78))
- **webdriverio:** add Internet Explorer 11 to the Sauce Labs configuration ([fdc32db](https://github.com/algolia/instantsearch-e2e-tests/commit/fdc32db))

# 1.0.0 (2019-08-12)

### Bug Fixes

- **spec:** fix stale element reference exceptions ([e347fc8](https://github.com/algolia/instantsearch-e2e-tests/commit/e347fc8))
- **typescript:** fix TypeScript configuration to transpile tests when in node_modules ([0d88b76](https://github.com/algolia/instantsearch-e2e-tests/commit/0d88b76))

### Features

- **spec:** add spec for search on specific brand and query filtering ([39f0ea0](https://github.com/algolia/instantsearch-e2e-tests/commit/39f0ea0))
- **spec:** add spec for search on specific price range ([5345c09](https://github.com/algolia/instantsearch-e2e-tests/commit/5345c09))
- **webdriverio:** add WebdriverIO local configuration ([e35cab5](https://github.com/algolia/instantsearch-e2e-tests/commit/e35cab5))
- **webdriverio:** add WebdriverIO Sauce Labs configuration ([9e044da](https://github.com/algolia/instantsearch-e2e-tests/commit/9e044da))
