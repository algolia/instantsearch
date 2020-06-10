## [2.7.1](https://github.com/algolia/vue-instantsearch/compare/v2.7.0...v2.7.1) (2020-06-10)


### Bug Fixes

* **Highlight, Snippet:** prevent XSS via routing ([#783](https://github.com/algolia/vue-instantsearch/issues/783)) ([f35446b](https://github.com/algolia/vue-instantsearch/commit/f35446b))
* **RangeInput:** refine correctly when start is given ([#777](https://github.com/algolia/vue-instantsearch/issues/777)) ([6eb46c8](https://github.com/algolia/vue-instantsearch/commit/6eb46c8))



# [2.7.0](https://github.com/algolia/vue-instantsearch/compare/v2.6.0...v2.7.0) (2020-01-23)


### Features

* **algoliasearch:** add support for algoliasearch v4 ([#756](https://github.com/algolia/vue-instantsearch/issues/756)) ([571b1fc](https://github.com/algolia/vue-instantsearch/commit/571b1fc))
* **StateResults:** give access to search parameters ([#627](https://github.com/algolia/vue-instantsearch/issues/627)) ([9870e85](https://github.com/algolia/vue-instantsearch/commit/9870e85))



# [2.6.0](https://github.com/algolia/vue-instantsearch/compare/v2.5.0...v2.6.0) (2019-10-14)


### Bug Fixes

* **Snippet:** switch tag replacement to mark ([#729](https://github.com/algolia/vue-instantsearch/issues/729)) ([7f30331](https://github.com/algolia/vue-instantsearch/commit/7f30331)), closes [#727](https://github.com/algolia/vue-instantsearch/issues/727)


### Features

* **core:** expose source files ([#726](https://github.com/algolia/vue-instantsearch/issues/726)) ([ede5852](https://github.com/algolia/vue-instantsearch/commit/ede5852))



# [2.5.0](https://github.com/algolia/vue-instantsearch/compare/v2.4.0...v2.5.0) (2019-09-18)


### Features

* expose `createSuitMixin` to use for class names in custom widgets ([#721](https://github.com/algolia/vue-instantsearch/issues/721)) ([5063ce1](https://github.com/algolia/vue-instantsearch/commit/5063ce1))



# [2.4.0](https://github.com/algolia/vue-instantsearch/compare/v2.3.0...v2.4.0) (2019-09-03)


### Features

* **searchbox:** Adds events to hook on to focus, blur, and reset ([#711](https://github.com/algolia/vue-instantsearch/issues/711)) ([0149d2f](https://github.com/algolia/vue-instantsearch/commit/0149d2f))



# [2.3.0](https://github.com/algolia/vue-instantsearch/compare/v2.2.2...v2.3.0) (2019-07-30)


### Bug Fixes

* **core:** prevent duplicating facet values ([#705](https://github.com/algolia/vue-instantsearch/issues/705)) ([7573be1](https://github.com/algolia/vue-instantsearch/commit/7573be1)), closes [#663](https://github.com/algolia/vue-instantsearch/issues/663)
* **error:** correct suggestion ([44f2d9c](https://github.com/algolia/vue-instantsearch/commit/44f2d9c))
* **ssr:** clearer error message when using ssr without the component ([#698](https://github.com/algolia/vue-instantsearch/issues/698)) ([20c2153](https://github.com/algolia/vue-instantsearch/commit/20c2153)), closes [#697](https://github.com/algolia/vue-instantsearch/issues/697)


### Features

* **RefinementList:** forward class names to input ([#696](https://github.com/algolia/vue-instantsearch/issues/696)) ([793eaf2](https://github.com/algolia/vue-instantsearch/commit/793eaf2)), closes [#644](https://github.com/algolia/vue-instantsearch/issues/644)



## [2.2.2](https://github.com/algolia/vue-instantsearch/compare/v2.2.1...v2.2.2) (2019-07-11)


### Bug Fixes

* **highlight:** change expected tag to replace ([#679](https://github.com/algolia/vue-instantsearch/issues/679)) ([4aa06fb](https://github.com/algolia/vue-instantsearch/commit/4aa06fb))



# [2.2.1](https://github.com/algolia/vue-instantsearch/compare/v2.1.0...v2.2.1) (2019-05-21)


### Features

* **panel:** provide hasRefinement scope to slots ([#670](https://github.com/algolia/vue-instantsearch/issues/670)) ([2a21b52](https://github.com/algolia/vue-instantsearch/commit/2a21b52)), closes [#347](https://github.com/algolia/vue-instantsearch/issues/347)
* **voiceSearch:** add voice search component ([#668](https://github.com/algolia/vue-instantsearch/issues/668)) ([84efffc](https://github.com/algolia/vue-instantsearch/commit/84efffc))



# [2.1.0](https://github.com/algolia/vue-instantsearch/compare/v2.0.1...v2.1.0) (2019-04-30)


### Bug Fixes

* **stories:** update range slider component to v3 ([#648](https://github.com/algolia/vue-instantsearch/issues/648)) ([e3010f6](https://github.com/algolia/vue-instantsearch/commit/e3010f6)), closes [#647](https://github.com/algolia/vue-instantsearch/issues/647)
* **toggle-refinement:** display label ([#649](https://github.com/algolia/vue-instantsearch/issues/649)) ([84c909d](https://github.com/algolia/vue-instantsearch/commit/84c909d))
* **ua:** change the User-Agent to use the new specs lib (version) ([#650](https://github.com/algolia/vue-instantsearch/issues/650)) ([6942979](https://github.com/algolia/vue-instantsearch/commit/6942979))


### Features

* **infiniteHits:** add previous button ([#659](https://github.com/algolia/vue-instantsearch/issues/659)) ([3d2eec9](https://github.com/algolia/vue-instantsearch/commit/3d2eec9))
* **insights:** add insights support to Hits widget ([#665](https://github.com/algolia/vue-instantsearch/issues/665)) ([2efa8c0](https://github.com/algolia/vue-instantsearch/commit/2efa8c0))
* **insights:** add insights support to InfiniteHits widget ([#666](https://github.com/algolia/vue-instantsearch/issues/666)) ([b3302cf](https://github.com/algolia/vue-instantsearch/commit/b3302cf))
* **insights:** add insightsClient support on storybook ([#664](https://github.com/algolia/vue-instantsearch/issues/664)) ([5ad4d3e](https://github.com/algolia/vue-instantsearch/commit/5ad4d3e))
* **query-rules:** add new widgets ([#652](https://github.com/algolia/vue-instantsearch/issues/652)) ([cec815d](https://github.com/algolia/vue-instantsearch/commit/cec815d))



## [2.0.1](https://github.com/algolia/vue-instantsearch/compare/v2.0.0...v2.0.1) (2019-03-13)


### Bug Fixes

* **umd:** prevent inclusion of Vue in bundle ([#635](https://github.com/algolia/vue-instantsearch/issues/635)) ([a90cbce](https://github.com/algolia/vue-instantsearch/commit/a90cbce))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/algolia/vue-instantsearch/compare/v2.0.0-beta.3...v2.0.0) (2019-02-18)


### Features

* **core:** update to InstantSearch.js v3 ([#612](https://github.com/algolia/vue-instantsearch/issues/612)) ([fbf818e](https://github.com/algolia/vue-instantsearch/commit/fbf818e)), closes [#619](https://github.com/algolia/vue-instantsearch/issues/619)
* **deps:** remove transitive dependencies ([6fa3169](https://github.com/algolia/vue-instantsearch/commit/6fa3169))



<a name="2.0.0-beta.3"></a>

# [2.0.0-beta.3](https://github.com/algolia/vue-instantsearch/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2019-01-23)

### Bug Fixes

- **components:** remove faulty whitespace ([#606](https://github.com/algolia/vue-instantsearch/issues/606)) ([c7541b1](https://github.com/algolia/vue-instantsearch/commit/c7541b1))
- **core:** hydrated always is false on dispose ([8851dec](https://github.com/algolia/vue-instantsearch/commit/8851dec))
- **errors:** less whitespace ([1dbd177](https://github.com/algolia/vue-instantsearch/commit/1dbd177))

### Features

- server side rendering ([#596](https://github.com/algolia/vue-instantsearch/issues/596)) ([a875bd9](https://github.com/algolia/vue-instantsearch/commit/a875bd9)), closes [#603](https://github.com/algolia/vue-instantsearch/issues/603) [#605](https://github.com/algolia/vue-instantsearch/issues/605) [#607](https://github.com/algolia/vue-instantsearch/issues/607) [algolia/instantsearch.js#3415](https://github.com/algolia/instantsearch.js/issues/3415)

<a name="2.0.0-beta.2"></a>

# [2.0.0-beta.2](https://github.com/algolia/vue-instantsearch/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2018-12-20)

### Bug Fixes

- **CurrentRefinements:** compute unique key ([#577](https://github.com/algolia/vue-instantsearch/issues/577)) ([4e941ca](https://github.com/algolia/vue-instantsearch/commit/4e941ca)), closes [#574](https://github.com/algolia/vue-instantsearch/issues/574)
- **PoweredBy:** new design & colors ([#578](https://github.com/algolia/vue-instantsearch/issues/578)) ([e1ea477](https://github.com/algolia/vue-instantsearch/commit/e1ea477)), closes [#571](https://github.com/algolia/vue-instantsearch/issues/571)
- **rating-menu:** remove nonfunctional min prop ([#597](https://github.com/algolia/vue-instantsearch/issues/597)) ([26891e6](https://github.com/algolia/vue-instantsearch/commit/26891e6))
- **RefinementList:** allow overriding of searchable placeholder ([#576](https://github.com/algolia/vue-instantsearch/issues/576)) ([d293b83](https://github.com/algolia/vue-instantsearch/commit/d293b83)), closes [#572](https://github.com/algolia/vue-instantsearch/issues/572)

### Features

- **MenuSelect:** use a slot for "defaultOption" ([#595](https://github.com/algolia/vue-instantsearch/issues/595)) ([2ca65f0](https://github.com/algolia/vue-instantsearch/commit/2ca65f0))

<a name="2.0.0-beta.1"></a>

# [2.0.0-beta.1](https://github.com/algolia/vue-instantsearch/compare/2.0.0-alpha.3...2.0.0-beta.1) (2018-11-06)

### Bug Fixes

- **CurrentRefinements:** use existing key ([5d0b72f](https://github.com/algolia/vue-instantsearch/commit/5d0b72f))
- **example:** add codesandbox config ([#556](https://github.com/algolia/vue-instantsearch/issues/556)) ([e7492eb](https://github.com/algolia/vue-instantsearch/commit/e7492eb))
- **Panel:** make body class name computed ([589f076](https://github.com/algolia/vue-instantsearch/commit/589f076))
- **RefinementList:** give canToggleShowMore to default slot ([08c325f](https://github.com/algolia/vue-instantsearch/commit/08c325f))
- **RefinementList:** pass createURL to item ([6834766](https://github.com/algolia/vue-instantsearch/commit/6834766))
- **SortBy:** label & value instead of label & name ([be42471](https://github.com/algolia/vue-instantsearch/commit/be42471))

### Features

- **CurrentRefinements:** consolidate API ([#550](https://github.com/algolia/vue-instantsearch/issues/550)) ([2b08b76](https://github.com/algolia/vue-instantsearch/commit/2b08b76))
- **CurrentRefinements:** expose createURL ([c0bf7e5](https://github.com/algolia/vue-instantsearch/commit/c0bf7e5))
- **CurrentRefinements:** give createURL to slot ([#557](https://github.com/algolia/vue-instantsearch/issues/557)) ([00c2865](https://github.com/algolia/vue-instantsearch/commit/00c2865))
- **InfiniteHits:** add loadMore slot ([d313acb](https://github.com/algolia/vue-instantsearch/commit/d313acb))
- **IS:** allow change of stalled search delay and search function ([1d38d5e](https://github.com/algolia/vue-instantsearch/commit/1d38d5e))
- **MenuSelect:** add createURL in slot ([d61fc82](https://github.com/algolia/vue-instantsearch/commit/d61fc82))
- **MenuSelect:** add item slot ([#555](https://github.com/algolia/vue-instantsearch/issues/555)) ([1071eea](https://github.com/algolia/vue-instantsearch/commit/1071eea))
- **RangeInput:** refine & currentRefinement sync ([#560](https://github.com/algolia/vue-instantsearch/issues/560)) ([433e88b](https://github.com/algolia/vue-instantsearch/commit/433e88b))
- **RatingMenu:** add slot for & up ([6717db6](https://github.com/algolia/vue-instantsearch/commit/6717db6))
- **RatingMenu:** createURL & stars ([038ec56](https://github.com/algolia/vue-instantsearch/commit/038ec56))
- **RefinementList:** provide SFFV query to default stot ([a32e38c](https://github.com/algolia/vue-instantsearch/commit/a32e38c))
- **router:** force object form ([#562](https://github.com/algolia/vue-instantsearch/issues/562)) ([5f1976d](https://github.com/algolia/vue-instantsearch/commit/5f1976d))
- **SearchBox:** forward class-names & slots ([#553](https://github.com/algolia/vue-instantsearch/issues/553)) ([b2122dd](https://github.com/algolia/vue-instantsearch/commit/b2122dd))

<a name="2.0.0-alpha.3"></a>

# [2.0.0-alpha.3](https://github.com/algolia/vue-instantsearch/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2018-10-02)

### Features

- **InstantSearch:** call addAlgoliaAgent if possible ([#537](https://github.com/algolia/vue-instantsearch/issues/537)) ([0f3079b](https://github.com/algolia/vue-instantsearch/commit/0f3079b))

<a name="1.5.0"></a>

# [1.5.0](https://github.com/algolia/vue-instantsearch/compare/v1.4.0...v1.5.0) (2018-03-02)

### Bug Fixes

- **menu:** avoid error when no facet values are retrieved ([0dbb683](https://github.com/algolia/vue-instantsearch/commit/0dbb683))

### Features

- **Pagination:** pass in the page when emitting the page change event ([#394](https://github.com/algolia/vue-instantsearch/issues/394)) ([a349e19](https://github.com/algolia/vue-instantsearch/commit/a349e19))

<a name="1.4.0"></a>

# [1.4.0](https://github.com/algolia/vue-instantsearch/compare/v1.3.4...v1.4.0) (2018-02-06)

### Bug Fixes

- **Highlight:** only warn once for possibly missing highlighting ([#386](https://github.com/algolia/vue-instantsearch/issues/386)) ([92ab6c4](https://github.com/algolia/vue-instantsearch/commit/92ab6c4)), closes [#385](https://github.com/algolia/vue-instantsearch/issues/385)

### Features

- **loading-indicator:** add API ([148577f](https://github.com/algolia/vue-instantsearch/commit/148577f))
- **loading-indicator:** initial implementation ([6bdf9a7](https://github.com/algolia/vue-instantsearch/commit/6bdf9a7))

<a name="1.3.4"></a>

## [1.3.4](https://github.com/algolia/vue-instantsearch/compare/v1.3.3...v1.3.4) (2018-01-24)

### Bug Fixes

- **doc:** `queryParameters` is not a function ([#377](https://github.com/algolia/vue-instantsearch/issues/377)) ([cd87cad](https://github.com/algolia/vue-instantsearch/commit/cd87cad))

### Features

- **Results:** add `index` (position) ([#382](https://github.com/algolia/vue-instantsearch/issues/382)) ([16c2c64](https://github.com/algolia/vue-instantsearch/commit/16c2c64))

<a name="1.3.3"></a>

## [1.3.3](https://github.com/algolia/vue-instantsearch/compare/v1.3.2...v1.3.3) (2017-12-04)

### Bug Fixes

- Powered-by component is not SSR compatible [#367](https://github.com/algolia/vue-instantsearch/issues/367) ([f372bd4](https://github.com/algolia/vue-instantsearch/commit/f372bd4))

<a name="1.3.2"></a>

## [1.3.2](https://github.com/algolia/vue-instantsearch/compare/v1.3.1...v1.3.2) (2017-11-15)

### Bug Fixes

- avoid query when components are destroyed ([c41c606](https://github.com/algolia/vue-instantsearch/commit/c41c606))

<a name="1.3.1"></a>

## [1.3.1](https://github.com/algolia/vue-instantsearch/compare/v1.3.0...v1.3.1) (2017-11-02)

### Bug Fixes

- **menu:** avoid multiple Algolia calls when created ([f1ac0a7](https://github.com/algolia/vue-instantsearch/commit/f1ac0a7))

### Performance Improvements

- **menu:** use facet name as key ([b496fd8](https://github.com/algolia/vue-instantsearch/commit/b496fd8))

<a name="1.3.0"></a>

# [1.3.0](https://github.com/algolia/vue-instantsearch/compare/v1.2.2...v1.3.0) (2017-10-25)

### Bug Fixes

- **menu:** mark attribute as required ([4b08b2d](https://github.com/algolia/vue-instantsearch/commit/4b08b2d))
- **menu:** use same default sortby as specified ([81a7781](https://github.com/algolia/vue-instantsearch/commit/81a7781))
- **Menu:** apply correctly css class ([cf996ae](https://github.com/algolia/vue-instantsearch/commit/cf996ae))
- **results:** remove key from slot ([d63c70b](https://github.com/algolia/vue-instantsearch/commit/d63c70b))
- **store:** update typo in test ([1430840](https://github.com/algolia/vue-instantsearch/commit/1430840))

### Features

- **docs:** add RangeInput section ([483583a](https://github.com/algolia/vue-instantsearch/commit/483583a))
- **Menu:** set `maxValuesPerFacet` from `limit` prop ([6f9f7a7](https://github.com/algolia/vue-instantsearch/commit/6f9f7a7))
- **RangeInput:** add className on separator ([d9b9b21](https://github.com/algolia/vue-instantsearch/commit/d9b9b21))
- **RangeInput:** add className on submit ([de8702a](https://github.com/algolia/vue-instantsearch/commit/de8702a))
- **RangeInput:** add widget ([cbc1e1b](https://github.com/algolia/vue-instantsearch/commit/cbc1e1b))
- **store:** add method for retrieve facetStats ([c0c83aa](https://github.com/algolia/vue-instantsearch/commit/c0c83aa))
- **widgets:** add Menu widget ([50c4c14](https://github.com/algolia/vue-instantsearch/commit/50c4c14))

<a name="1.2.2"></a>

## [1.2.2](https://github.com/algolia/vue-instantsearch/compare/v1.2.1...v1.2.2) (2017-10-17)

### Bug Fixes

- **results:** remove key from slot ([8270847](https://github.com/algolia/vue-instantsearch/commit/8270847))

<a name="1.2.1"></a>

## [1.2.1](https://github.com/algolia/vue-instantsearch/compare/v1.2.0...v1.2.1) (2017-10-17)

### Bug Fixes

- **stats:** only use toLocaleString in display ([62699e9](https://github.com/algolia/vue-instantsearch/commit/62699e9))

<a name="1.2.0"></a>

# [1.2.0](https://github.com/algolia/vue-instantsearch/compare/v1.1.0...v1.2.0) (2017-10-13)

### Features

- **stats:** update stats component to use toLocaleString() ([3b41db3](https://github.com/algolia/vue-instantsearch/commit/3b41db3))

<a name="1.1.0"></a>

# [1.1.0](https://github.com/algolia/vue-instantsearch/compare/v1.0.1...v1.1.0) (2017-10-10)

### Bug Fixes

- **pagination:** remove class duplicates ([c56ea2b](https://github.com/algolia/vue-instantsearch/commit/c56ea2b))

### Features

- **component:** add an option to bem utility to not output element class ([6d4e690](https://github.com/algolia/vue-instantsearch/commit/6d4e690))
- **pagination:** add classes on link elements ([d39da3e](https://github.com/algolia/vue-instantsearch/commit/d39da3e))

<a name="1.0.1"></a>

## [1.0.1](https://github.com/algolia/vue-instantsearch/compare/v1.0.0...v1.0.1) (2017-09-25)

### Bug Fixes

- **instantsearch:** allow to treeshake es module ([f419329](https://github.com/algolia/vue-instantsearch/commit/f419329))

<a name="1.0.0"></a>

# [1.0.0](https://github.com/algolia/vue-instantsearch/compare/v0.7.0...v1.0.0) (2017-08-23)

### Features

- **highlight:** get attribute value by dot separated path ([6ddc7c7](https://github.com/algolia/vue-instantsearch/commit/6ddc7c7))
- **highlight:** throw error if missing config in Algolia ([09d8d3d](https://github.com/algolia/vue-instantsearch/commit/09d8d3d))
- **snippet:** throw error if missing configuration in Algolia ([6988cb2](https://github.com/algolia/vue-instantsearch/commit/6988cb2))

<a name="0.7.0"></a>

# [0.7.0](https://github.com/algolia/vue-instantsearch/compare/v0.6.0...v0.7.0) (2017-08-15)

### Bug Fixes

- **helper-serializer:** allow to serialize a helper that has no results ([cf2add9](https://github.com/algolia/vue-instantsearch/commit/cf2add9))

### Code Refactoring

- **store:** remove searchParameters getter and setter ([c146b16](https://github.com/algolia/vue-instantsearch/commit/c146b16))

### Features

- **store:** improve query parameters merge strategy ([0472627](https://github.com/algolia/vue-instantsearch/commit/0472627))

### Reverts

- **store:** have highlighting tags return the current value ([3d65391](https://github.com/algolia/vue-instantsearch/commit/3d65391))

### BREAKING CHANGES

- **store:** if you previously used the `store.searchParameters` getters and setters of the store,
  you should now use `store.queryParameters` instead.

<a name="0.6.0"></a>

# [0.6.0](https://github.com/algolia/vue-instantsearch/compare/v0.5.0...v0.6.0) (2017-08-08)

### Bug Fixes

- **refinement-list:** remove duplicated class ([728314c](https://github.com/algolia/vue-instantsearch/commit/728314c))
- **sort-by-selector:** make SSR ready ([e50c38a](https://github.com/algolia/vue-instantsearch/commit/e50c38a))
- **store:** avoid mutating query parameters ([cb8cfb7](https://github.com/algolia/vue-instantsearch/commit/cb8cfb7))
- make all components SSR ready ([4db0720](https://github.com/algolia/vue-instantsearch/commit/4db0720))

### Features

- **index:** add a prop to enable/disable cache ([268c0b6](https://github.com/algolia/vue-instantsearch/commit/268c0b6))
- **index:** add a prop to toggle auto search on load ([3c85017](https://github.com/algolia/vue-instantsearch/commit/3c85017))
- **store:** add methods to interact with cache ([98406fb](https://github.com/algolia/vue-instantsearch/commit/98406fb))
- **store:** do not automatically refresh when using start() ([cda198c](https://github.com/algolia/vue-instantsearch/commit/cda198c))
- **store:** do not register facet if already existing ([6370bd1](https://github.com/algolia/vue-instantsearch/commit/6370bd1))

### Performance Improvements

- use unique keys in all v-for loops ([fdbf56a](https://github.com/algolia/vue-instantsearch/commit/fdbf56a))

### BREAKING CHANGES

- **store:** using `store.start()` will no longer trigger an Algolia call.
  if you were using `store.stop()`/`store.start()` you should now
  also call `store.refresh()` if you want your store to stay in sync with Algolia.

<a name="0.5.0"></a>

# [0.5.0](https://github.com/algolia/vue-instantsearch/compare/v0.4.0...v0.5.0) (2017-08-05)

### Features

- **pagination:** emit "page-change" event after page has changed ([a259cc5](https://github.com/algolia/vue-instantsearch/commit/a259cc5))
- **refinement-list:** add BEM classes for labels and checkboxes ([5c4f463](https://github.com/algolia/vue-instantsearch/commit/5c4f463))

<a name="0.4.0"></a>

# [0.4.0](https://github.com/algolia/vue-instantsearch/compare/v0.3.2...v0.4.0) (2017-08-02)

### Bug Fixes

- **component:** avoid raising injection failure warning ([3185548](https://github.com/algolia/vue-instantsearch/commit/3185548))
- **index:** trigger error message when index context is missing ([edbabdd](https://github.com/algolia/vue-instantsearch/commit/edbabdd))
- **powered-by:** ensure search store is not required ([bc0a19f](https://github.com/algolia/vue-instantsearch/commit/bc0a19f))
- **spelling:** run most code through a spell checker (#226) ([640fec3](https://github.com/algolia/vue-instantsearch/commit/640fec3))

### Code Refactoring

- **store:** do not expose highlighting tags ([d3ee912](https://github.com/algolia/vue-instantsearch/commit/d3ee912))
- **store:** remove pagination utility methods ([3bdf759](https://github.com/algolia/vue-instantsearch/commit/3bdf759)), closes [#228](https://github.com/algolia/vue-instantsearch/issues/228)

### Features

- add keys to all for loops ([a36a493](https://github.com/algolia/vue-instantsearch/commit/a36a493))

### BREAKING CHANGES

- **store:** pagination utility methods have been removed. This includes `goToFirstPage`, `goToPreviousPage`, `goToNextPage` and `goToLastPage`.
- **store:** HIGHLIGHT_PRE_TAG and HIGHLIGHT_POST_TAG are no longer exported.

<a name="0.3.2"></a>

## [0.3.2](https://github.com/algolia/vue-instantsearch/compare/v0.3.1...v0.3.2) (2017-07-30)

### Bug Fixes

- **rating:** correct star counts ([a499be4](https://github.com/algolia/vue-instantsearch/commit/a499be4))

<a name="0.3.1"></a>

## [0.3.1](https://github.com/algolia/vue-instantsearch/compare/v0.3.0...v0.3.1) (2017-07-26)

Update the readme on npm website.

<a name="0.3.0"></a>

# [0.3.0](https://github.com/algolia/vue-instantsearch/compare/v0.2.1...v0.3.0) (2017-07-21)

### Bug Fixes

- **pagination:** ensure page never drops below first page ([e851553](https://github.com/algolia/vue-instantsearch/commit/e851553))
- **pagination:** hide pagination if there are not results ([f4dac58](https://github.com/algolia/vue-instantsearch/commit/f4dac58))
- **store:** catch errors on facet values retrieval ([a51a547](https://github.com/algolia/vue-instantsearch/commit/a51a547))
- **store:** make sure serialization contains hl tags ([4e8a7de](https://github.com/algolia/vue-instantsearch/commit/4e8a7de))
- **store:** reject wait sync if error occurs ([9568ddf](https://github.com/algolia/vue-instantsearch/commit/9568ddf))

### Features

- **sanitize-results:** add a module to sanitize results ([e78cacd](https://github.com/algolia/vue-instantsearch/commit/e78cacd))
- **search-box:** add autofocus capabilities ([0c91334](https://github.com/algolia/vue-instantsearch/commit/0c91334))
- **store:** allow to use custom highlight tags ([c77f336](https://github.com/algolia/vue-instantsearch/commit/c77f336))
- **store:** escape results when fetched ([61341a9](https://github.com/algolia/vue-instantsearch/commit/61341a9))

### Performance Improvements

- **store:** cache sanitized results ([62858b2](https://github.com/algolia/vue-instantsearch/commit/62858b2))

### BREAKING CHANGES

- Highlight and Snippet components no longer accept `tag-name` nor `escape-html`
  as props. Highlighted values are now escaped as responses are received.
  The highlighting tags can now be configured on the store itself.

<a name="0.2.1"></a>

## [0.2.1](https://github.com/algolia/vue-instantsearch/compare/v0.2.0...v0.2.1) (2017-05-29)

<a name="0.2.0"></a>

# 0.2.0 (2017-05-29)

### Bug Fixes

- **bem:** make sure blockClassName is provided by component ([826bbc9](https://github.com/algolia/vue-instantsearch/commit/826bbc9))
- **build:** build cjs and es builds before UMD to satisfy inheritance chain ([78545f9](https://github.com/algolia/vue-instantsearch/commit/78545f9))
- **build:** fix build scripts ([42beeb2](https://github.com/algolia/vue-instantsearch/commit/42beeb2))
- **clear:** use clearsQuery instead of clearQuery (#91) ([74e8dcb](https://github.com/algolia/vue-instantsearch/commit/74e8dcb))
- **clear-search:** remove "label" prop and inline it ([c1e74db](https://github.com/algolia/vue-instantsearch/commit/c1e74db))
- **empty-results:** prefix container class name ([6bd49ea](https://github.com/algolia/vue-instantsearch/commit/6bd49ea))
- **examples:** rename attribute to attribute-name ([6dc4740](https://github.com/algolia/vue-instantsearch/commit/6dc4740))
- **highlight:** gracefully display empty string if attr is not available ([3976dca](https://github.com/algolia/vue-instantsearch/commit/3976dca))
- **highlight:** support replacing multiple highlighting tags ([84478c2](https://github.com/algolia/vue-instantsearch/commit/84478c2))
- **input:** better mobile experience ([c58980b](https://github.com/algolia/vue-instantsearch/commit/c58980b))
- **input:** revert back to input as root element ([b293ac7](https://github.com/algolia/vue-instantsearch/commit/b293ac7))
- **navigation-tree:** fix invalid scss rule ([33f07ee](https://github.com/algolia/vue-instantsearch/commit/33f07ee))
- **navigation-tree:** make style rules less specific ([1570fac](https://github.com/algolia/vue-instantsearch/commit/1570fac))
- **navigation-tree:** remove non generic style rule ([a166d9e](https://github.com/algolia/vue-instantsearch/commit/a166d9e))
- **navigation-tree:** use more concise style rule ([5699228](https://github.com/algolia/vue-instantsearch/commit/5699228))
- **pagination:** avoids underlining disabled button ([312b06c](https://github.com/algolia/vue-instantsearch/commit/312b06c))
- **powered-by:** set a default width for the SVG logo ([5304df5](https://github.com/algolia/vue-instantsearch/commit/5304df5))
- **powered-by:** use shorter version of SVG logo ([5d4f760](https://github.com/algolia/vue-instantsearch/commit/5d4f760))
- **price-range-facet:** add missing props and respect class naming conventions ([99741db](https://github.com/algolia/vue-instantsearch/commit/99741db))
- **ranged-pagination:** make pagination start at 1 ([7c4864f](https://github.com/algolia/vue-instantsearch/commit/7c4864f))
- **ranged-pagination:** make style rules less specific ([7e284fc](https://github.com/algolia/vue-instantsearch/commit/7e284fc))
- **ranged-pagination:** removed non generic style rule from component ([cba0e5d](https://github.com/algolia/vue-instantsearch/commit/cba0e5d))
- **rating:** HTML UTF-8 characters ([b8012e9](https://github.com/algolia/vue-instantsearch/commit/b8012e9))
- **rating:** renamed StarsFacet to RatingFacet ([13b6ea7](https://github.com/algolia/vue-instantsearch/commit/13b6ea7))
- **rating-facet:** make style rule less specific ([60cbeb0](https://github.com/algolia/vue-instantsearch/commit/60cbeb0))
- **scss:** make price range component css less specific ([e5ea957](https://github.com/algolia/vue-instantsearch/commit/e5ea957))
- **search-facet:** make style rules less specific ([a1f8e14](https://github.com/algolia/vue-instantsearch/commit/a1f8e14))
- **search-facet:** remove non generic style rule ([3cace70](https://github.com/algolia/vue-instantsearch/commit/3cace70))
- **search-results:** make page start at 1 ([b284957](https://github.com/algolia/vue-instantsearch/commit/b284957))
- **search-store:** make page start at 1 ([917706b](https://github.com/algolia/vue-instantsearch/commit/917706b))
- **snippet:** gracefully handle missing snippet attribute ([d888f97](https://github.com/algolia/vue-instantsearch/commit/d888f97))
- **snippet:** support replacing multiple highlighting tags ([15280ee](https://github.com/algolia/vue-instantsearch/commit/15280ee))
- **store:** better handle facet addition and removal ([bda4dc1](https://github.com/algolia/vue-instantsearch/commit/bda4dc1))
- **store:** make page search parameter start at 1 ([062f09c](https://github.com/algolia/vue-instantsearch/commit/062f09c))
- **store:** remove SearchParameters explicit import ([4c665fe](https://github.com/algolia/vue-instantsearch/commit/4c665fe))
- **travis:** switch to npm client ([5065718](https://github.com/algolia/vue-instantsearch/commit/5065718))
- **tree-menu:** correct mis-usage of bem syntax ([d511d03](https://github.com/algolia/vue-instantsearch/commit/d511d03))

### Features

- **bem:** support block modifier class names ([7bde05c](https://github.com/algolia/vue-instantsearch/commit/7bde05c))
- **component-scss:** add the styles to the components ([372d635](https://github.com/algolia/vue-instantsearch/commit/372d635))
- **components:** add powered by support ([1f750b8](https://github.com/algolia/vue-instantsearch/commit/1f750b8))
- **e-commerce:** add powered by ([4666392](https://github.com/algolia/vue-instantsearch/commit/4666392))
- **empty-results:** expose the "query" inside of the slot ([4206d89](https://github.com/algolia/vue-instantsearch/commit/4206d89))
- **example-simple:** bootstrap a simple example using UMD build ([bb68c7c](https://github.com/algolia/vue-instantsearch/commit/bb68c7c))
- **examples:** add multi-index example ([cf9746d](https://github.com/algolia/vue-instantsearch/commit/cf9746d))
- **highlight:** add a functional Highlight component ([f411394](https://github.com/algolia/vue-instantsearch/commit/f411394))
- **highlight:** add an option to disable escaping the html ([988b572](https://github.com/algolia/vue-instantsearch/commit/988b572))
- **highlight:** add Highlight component to the InstantSearch plugin ([993fa51](https://github.com/algolia/vue-instantsearch/commit/993fa51))
- **highlight:** make examples use the new Highlight component ([fa377c6](https://github.com/algolia/vue-instantsearch/commit/fa377c6))
- **inline-scss:** add the basic css to the components ([1642a56](https://github.com/algolia/vue-instantsearch/commit/1642a56))
- **multi-index:** add powered by ([38bebb9](https://github.com/algolia/vue-instantsearch/commit/38bebb9))
- **navigation-tree:** introduce a slot to allow overriding of labels ([1e278a0](https://github.com/algolia/vue-instantsearch/commit/1e278a0))
- **pagination:** use bem method to generate customizable classes ([7e1c52d](https://github.com/algolia/vue-instantsearch/commit/7e1c52d))
- **playground:** add example of search facet label ovverriding ([7706f32](https://github.com/algolia/vue-instantsearch/commit/7706f32))
- **playground:** add example on how to override empty results ([302d1ad](https://github.com/algolia/vue-instantsearch/commit/302d1ad))
- **playground:** add slot overriding example for ranged pagination ([dd084a8](https://github.com/algolia/vue-instantsearch/commit/dd084a8))
- **playground:** example of navigation tree custom label ([512d4b4](https://github.com/algolia/vue-instantsearch/commit/512d4b4))
- **playground:** showcase stars in rating component ([b46ae70](https://github.com/algolia/vue-instantsearch/commit/b46ae70))
- **powered-by:** add hostname to generated URL ([01bc789](https://github.com/algolia/vue-instantsearch/commit/01bc789))
- **powered-by:** create powered by component ([5fc1915](https://github.com/algolia/vue-instantsearch/commit/5fc1915))
- **ranged-pagination:** better slots for ranged pagination ([85ac789](https://github.com/algolia/vue-instantsearch/commit/85ac789))
- **rating:** add example of label overriding to playground ([0919170](https://github.com/algolia/vue-instantsearch/commit/0919170))
- **rating:** allow for easy override of rating labels ([e51bb77](https://github.com/algolia/vue-instantsearch/commit/e51bb77))
- **search-box:** improve accessibility ([20b2725](https://github.com/algolia/vue-instantsearch/commit/20b2725))
- **search-facet:** add a slot to override label ([f78b8a0](https://github.com/algolia/vue-instantsearch/commit/f78b8a0))
- **search-form:** introduce SearchForm component ([beb34e1](https://github.com/algolia/vue-instantsearch/commit/beb34e1))
- **search-results:** add header and footer slot and hide when no results ([e5cb24a](https://github.com/algolia/vue-instantsearch/commit/e5cb24a))
- **search-store:** make query reactive in search store component ([e666ff3](https://github.com/algolia/vue-instantsearch/commit/e666ff3))
- **search-store:** override highlight tags and expose them ([687ff2a](https://github.com/algolia/vue-instantsearch/commit/687ff2a))
- **snippet:** add a Snippet component ([f62c78c](https://github.com/algolia/vue-instantsearch/commit/f62c78c))
- **snippet:** add an option to disable the html escaping ([70abc28](https://github.com/algolia/vue-instantsearch/commit/70abc28))
- **snippet:** add the Snippet component to the InstantSearch plugin ([26483b6](https://github.com/algolia/vue-instantsearch/commit/26483b6))
- **sort-by-selector:** add scoped properties to default slot ([6d56622](https://github.com/algolia/vue-instantsearch/commit/6d56622))
- **stats:** add scoped properties to default slot ([abdf64b](https://github.com/algolia/vue-instantsearch/commit/abdf64b))
- **store:** add query parameters setter & getter ([c6e09a5](https://github.com/algolia/vue-instantsearch/commit/c6e09a5))
- **store:** add serializing capabilities ([90f5347](https://github.com/algolia/vue-instantsearch/commit/90f5347))
- **store:** add user agent to client ([5b1e469](https://github.com/algolia/vue-instantsearch/commit/5b1e469))
- **store:** allow to set and get all search parameters at once ([32cc1a1](https://github.com/algolia/vue-instantsearch/commit/32cc1a1))
- **store:** allow to wait for the store to be in sync ([279f2bb](https://github.com/algolia/vue-instantsearch/commit/279f2bb))
- **store:** throw an error if not constructed with a helper ([cbec746](https://github.com/algolia/vue-instantsearch/commit/cbec746))
- **store:** unset query parameter when value is null or undefined ([801914e](https://github.com/algolia/vue-instantsearch/commit/801914e))
- **store-component:** add query parameters as a property ([c54bd8c](https://github.com/algolia/vue-instantsearch/commit/c54bd8c))
- **tree-menu:** add class to list element ([578c9ab](https://github.com/algolia/vue-instantsearch/commit/578c9ab))
- **tree-menu:** allow infinite number of nested levels ([b7217e9](https://github.com/algolia/vue-instantsearch/commit/b7217e9))
- **url-sync-example:** add URL sync example with Vue Router ([ec70e91](https://github.com/algolia/vue-instantsearch/commit/ec70e91))

### Performance Improvements

- **store:** use Algolia light client ([4a58b57](https://github.com/algolia/vue-instantsearch/commit/4a58b57))
