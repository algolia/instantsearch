# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.7...v2.0.0) (2025-10-22)

### ⚠ BREAKING CHANGES

* Migrated to React InstantSearch v7. This version is only compatible with `react-instantsearch` v7.x.
* Minimum React version is now 16.8.0 (hooks requirement).
* Peer dependency changed from `react-instantsearch-dom` to `react-instantsearch`.

**Migration:** See the complete [Migration Guide (v1 → v2)](./MIGRATION_V1_TO_V2.md) for step-by-step instructions.

### Features

* Migrated from connector pattern to hooks-based architecture using `useRefinementList`
* Updated to use React InstantSearch v7 APIs
* Maintained full backward compatibility with widget props
* Enhanced TypeScript types for better IDE support

### Internal Changes

* Replaced `connectRefinementList` connector with `useRefinementList` hook
* Removed deprecated `translatable` HOC in favour of direct translation props
* Removed `createClassNames` utility, implemented custom class name builder
* Updated all internal dependencies to v7 equivalents
* Updated example application to demonstrate v7 usage

### [1.4.7](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.6...v1.4.7) (2022-10-06)


### Bug Fixes

* **metadata:** expose $$widgetType ([#2](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues/2)) ([0f3ecdc](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/0f3ecdc44f3e2dbf27b97ad862d1b87005d21099))

### [1.4.6](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.5...v1.4.6) (2022-07-06)

### [1.4.5](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.4...v1.4.5) (2022-01-19)

### [1.4.4](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.3...v1.4.4) (2022-01-19)

### [1.4.3](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.2...v1.4.3) (2022-01-19)

### [1.4.2](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.1...v1.4.2) (2021-11-15)

### [1.4.1](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.4.0...v1.4.1) (2021-08-13)


### Bug Fixes

* remove useless transformItems ([fe3393d](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/fe3393d47ea5924aceb829ba676610761547a4cb))

## [1.4.0](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.3.2...v1.4.0) (2021-08-12)


### Features

* add pinRefined option ([4808406](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/48084061b20fe8086c3dabe3e90304dcb0d3f1f1))

### [1.3.2](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.3.1...v1.3.2) (2021-08-12)

### [1.3.1](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.3.0...v1.3.1) (2021-08-12)


### Bug Fixes

* disable css source maps ([a6846a5](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/a6846a5b5ddc8ece927a9f48a48df9dc4faa82b3))

## [1.3.0](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.2.4...v1.3.0) (2021-08-12)


### Features

* add css variables ([6a9fa00](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/6a9fa00c5dbcb85227b8199729726078e2b675f9))
* **example:** add translations and responsive ([6c057ca](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/6c057ca4f7851145935ca7c705b1ac622005c431))
* add translations and className props ([ff1975c](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/ff1975cd6ac0331eb59847c519b879d46ca49344))

### [1.2.4](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.2.3...v1.2.4) (2021-08-12)


### Bug Fixes

* returned widget type ([2b3ee7c](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/2b3ee7c1e04c78e2674b91afd8ffd530ceb87ce0))

### [1.2.3](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.2.2...v1.2.3) (2021-08-11)


### Bug Fixes

* check parsed item ([2963088](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/2963088a119b04684f3064cad7e2fffff0effa6f))

### [1.2.2](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.2.1...v1.2.2) (2021-08-11)


### Bug Fixes

* throw an error if separator not found ([1d0fc87](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/1d0fc87cb8f432136708d83cee9b33cd703caca2))

### [1.2.1](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.2.0...v1.2.1) (2021-08-11)


### Bug Fixes

* update deps and add peer deps ([e7faf73](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/e7faf7359a7b0634d2fc047efca2bb5a9a4712c4))

## [1.2.0](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.1.2...v1.2.0) (2021-08-11)


### Features

* add separator option and url as color value ([dbec558](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/dbec558731ea9b14fb7c7a0445b3e15cbbfca554))
* update example ([7e5fbd4](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/7e5fbd4fb90ad947e7ebdf291348537c60b48e50))


### Bug Fixes

* can't import package using ESM ([25105b5](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/25105b597585d30263bd2b08506415f3b86ab0ef))
* **example:** remove stylesheet ([4c47926](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/4c479264b118e120dd5410ad1e83f36c3686da0f))
* **example:** update css layout ([0f9e4f3](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/0f9e4f3c51f82c449698428cc4dd19bf15065d9e))

### [1.1.2](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.1.1...v1.1.2) (2021-07-07)


### Bug Fixes

* styles were imported in typings ([59b5ce0](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/59b5ce067141fb518ed34d0bc13d7ca48bf1031f))

### [1.1.1](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.1.0...v1.1.1) (2021-07-07)


### Bug Fixes

* **package:** add missing export ([2ec53af](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/2ec53af4ba875a2b74dea9ac62273765eac8429d))

## [1.1.0](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.0.2...v1.1.0) (2021-07-06)


### Features

* split styles so they can be imported ([fc09bf7](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/fc09bf7440fc5ee57408dcfef93b7f7e9e3adc3c))

### [1.0.2](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.0.1...v1.0.2) (2021-07-05)


### Bug Fixes

* **package:** vite config library global name ([2c98ef6](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/2c98ef68257e4bfb39d079512754bdd16027005f))

### [1.0.1](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/compare/v1.0.0...v1.0.1) (2021-07-02)


### Bug Fixes

* throw an error if color format is bad ([d933343](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/d9333436f45c3063f479d18ec94e09a12b0b6a7d))

## 1.0.0 (2021-07-02)


### Bug Fixes

* **count:** add satellite class name ([0f96f2e](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/0f96f2ed3e07a85ac168d4251ff5f4d1151d76f6))
* **utils:** hex parsing 3 digits to 6 digits ([5b0857f](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/commit/5b0857fef1488f5a947d2645e86b40c6a0313945))
