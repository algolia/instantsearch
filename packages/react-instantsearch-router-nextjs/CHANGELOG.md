# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.5.6](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.5.5...react-instantsearch-router-nextjs@7.5.6) (2024-02-13)


### Bug Fixes

* **packaging:** remove non-exposed "source" key ([#6044](https://github.com/algolia/instantsearch/issues/6044)) ([77f0c48](https://github.com/algolia/instantsearch/commit/77f0c48d6458aa2d2ab4af804fbaf45f0839d88b))





## [7.5.5](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.5.4...react-instantsearch-router-nextjs@7.5.5) (2024-02-06)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.5.4](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.5.3...react-instantsearch-router-nextjs@7.5.4) (2024-01-30)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.5.3](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.5.2...react-instantsearch-router-nextjs@7.5.3) (2024-01-23)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.5.2](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.5.1...react-instantsearch-router-nextjs@7.5.2) (2024-01-16)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.5.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.5.0...react-instantsearch-router-nextjs@7.5.1) (2024-01-16)


### Bug Fixes

* **nextjs:** prevent onUpdate/onStateChange on own write ([#5949](https://github.com/algolia/instantsearch/issues/5949)) ([bbb27fc](https://github.com/algolia/instantsearch/commit/bbb27fc8839e7b775b599f411f6e8336771b0466))





## [7.5.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.4.1...react-instantsearch-router-nextjs@7.5.0) (2023-12-19)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.4.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.4.0...react-instantsearch-router-nextjs@7.4.1) (2023-12-07)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.3.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.3.0...react-instantsearch-router-nextjs@7.3.1) (2023-11-28)


### Bug Fixes

* **next:** mark compatibility with next 14 ([#5934](https://github.com/algolia/instantsearch/issues/5934)) ([a894389](https://github.com/algolia/instantsearch/commit/a8943896a19c57fabf54d4b8fea495c57fe6846e))





## [7.3.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.2.1...react-instantsearch-router-nextjs@7.3.0) (2023-10-31)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.2.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.2.0...react-instantsearch-router-nextjs@7.2.1) (2023-10-24)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.2.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.1.0...react-instantsearch-router-nextjs@7.2.0) (2023-10-10)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.1.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.0.3...react-instantsearch-router-nextjs@7.0.4) (2023-09-19)


### Bug Fixes

* **prettier:** consistent version ([#5850](https://github.com/algolia/instantsearch/issues/5850)) ([ca59c6d](https://github.com/algolia/instantsearch/commit/ca59c6dbd5c9eac4e2e0179a24e39bca997ae141))





## [7.0.3](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.0.2...react-instantsearch-router-nextjs@7.0.3) (2023-09-12)

**Note:** Version bump only for package react-instantsearch-router-nextjs





## [7.0.2](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.0.1...react-instantsearch-router-nextjs@7.0.2) (2023-09-05)

**Note:** Version bump only for package react-instantsearch-router-nextjs

## [7.0.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-router-nextjs@7.0.0...react-instantsearch-router-nextjs@7.0.1) (2023-08-08)

**Note:** Version bump only for package react-instantsearch-router-nextjs

# 7.0.0 (2023-08-07)

### Features

- rename packages ([#5787](https://github.com/algolia/instantsearch/issues/5787)) ([c133170](https://github.com/algolia/instantsearch/commit/c133170e563592dfc15a95daced1f8447327a09a))

### Breaking Changes

The following APIs have been changed:

- `useInstantSearch().use` -> `useInstantSearch().addMiddlewares`
- `<Stats translations={{ stats: "..." }} />` -> `<Stats translations={{ rootElementText: "..." }} />`
- `getServerState` now requires `renderToString` to be passed as an option.

See detailed instructions in the [upgrade guide](https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/).

## [6.47.3](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.47.2...react-instantsearch-hooks-router-nextjs@6.47.3) (2023-07-27)

### Bug Fixes

- add a future warning when the package name changes ([#5778](https://github.com/algolia/instantsearch/issues/5778)) ([3d22ee4](https://github.com/algolia/instantsearch/commit/3d22ee45e1f03a443323a371621262f1fe45e664))

## [6.47.2](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.47.1...react-instantsearch-hooks-router-nextjs@6.47.2) (2023-07-25)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.47.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.47.0...react-instantsearch-hooks-router-nextjs@6.47.1) (2023-07-19)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.47.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.46.0...react-instantsearch-hooks-router-nextjs@6.47.0) (2023-07-18)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.46.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.45.1...react-instantsearch-hooks-router-nextjs@6.46.0) (2023-07-10)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.45.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.45.0...react-instantsearch-hooks-router-nextjs@6.45.1) (2023-07-04)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.45.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.44.3...react-instantsearch-hooks-router-nextjs@6.45.0) (2023-06-20)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.44.3](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.44.2...react-instantsearch-hooks-router-nextjs@6.44.3) (2023-06-13)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.44.2](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.44.1...react-instantsearch-hooks-router-nextjs@6.44.2) (2023-06-05)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.44.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.44.0...react-instantsearch-hooks-router-nextjs@6.44.1) (2023-05-30)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.43.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.43.0...react-instantsearch-hooks-router-nextjs@6.43.1) (2023-05-16)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

# [6.43.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.42.2...react-instantsearch-hooks-router-nextjs@6.43.0) (2023-04-24)

### Bug Fixes

- **dependencies:** depend on sync version of React InstantSearch Hooks ([#5600](https://github.com/algolia/instantsearch/issues/5600)) ([82cfbd8](https://github.com/algolia/instantsearch/commit/82cfbd8cba47b2e9d0c8f8c74107d2ead1d072bf)), closes [#5568](https://github.com/algolia/instantsearch/issues/5568)

### Features

- **metadata:** register metadata around middleware ([#5492](https://github.com/algolia/instantsearch/issues/5492)) ([3e72ec8](https://github.com/algolia/instantsearch/commit/3e72ec82894a05a071328a4802d2f764233fe005))

## [6.42.2](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.42.1...react-instantsearch-hooks-router-nextjs@6.42.2) (2023-04-11)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.42.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.42.0...react-instantsearch-hooks-router-nextjs@6.42.1) (2023-03-28)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.42.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.41.0...react-instantsearch-hooks-router-nextjs@6.42.0) (2023-03-21)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.41.0](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.40.1...react-instantsearch-hooks-router-nextjs@6.41.0) (2023-03-07)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.40.2](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.40.1...react-instantsearch-hooks-router-nextjs@6.40.2) (2023-02-28)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

## [6.40.1](https://github.com/algolia/instantsearch/compare/react-instantsearch-hooks-router-nextjs@6.40.0...react-instantsearch-hooks-router-nextjs@6.40.1) (2023-02-21)

**Note:** Version bump only for package react-instantsearch-hooks-router-nextjs

# 6.40.0 (2023-02-14)

### Features

- handling routing in Next.js ([#5432](https://github.com/algolia/instantsearch/issues/5432)) ([39b5859](https://github.com/algolia/instantsearch/commit/39b5859ba78a5e8472a80e357a35ba900c963b61))
