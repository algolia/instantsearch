# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 5.0.0 (2022-12-20)


### Bug Fixes

* correctly output junit report in target repository (algolia/instantsearch-e2e-tests[#32](https://github.com/algolia/instantsearch.js/issues/32)) ([9fee82e](https://github.com/algolia/instantsearch.js/commit/9fee82e290d2feed084baa4bf3654e3744eb7b27))
* **helper:** fix dragAndDropByOffset helper Internet Explorer 11 compatibility ([6e56137](https://github.com/algolia/instantsearch.js/commit/6e561376575c77f2d39c872111cb95a9445f4330))
* **helper:** fix getSelectedHierarchicalMenuItems to wait for the elements ([0e3d8fc](https://github.com/algolia/instantsearch.js/commit/0e3d8fc3fa1bf68a3557a635bf02b94e746e14f6))
* **helper:** fix getTextFromElements helper to use getText selector ([6d174c5](https://github.com/algolia/instantsearch.js/commit/6d174c5241b4db8c2b46563f6ab5eaa6638f18a2))
* **helper:** fix helpers to handle RangeSlider in react-instantsearch (algolia/instantsearch-e2e-tests[#9](https://github.com/algolia/instantsearch.js/issues/9)) ([eb896dc](https://github.com/algolia/instantsearch.js/commit/eb896dc9057f0891a124759d85e8017aedeee653))
* **helper:** fix helpers to handle RangeSlider in vue-instantsearch (algolia/instantsearch-e2e-tests[#12](https://github.com/algolia/instantsearch.js/issues/12)) ([31769cc](https://github.com/algolia/instantsearch.js/commit/31769ccefdda6344a39d611db9ea862b7c494020))
* **helper:** fix helpers to scroll to elements before attempting to click on it (algolia/instantsearch-e2e-tests[#6](https://github.com/algolia/instantsearch.js/issues/6)) ([a4ebaed](https://github.com/algolia/instantsearch.js/commit/a4ebaed17a0fc5c852fb48d2145ac1065291ad66))
* **helper:** fix setRangeSliderLowerBound offset calculation (algolia/instantsearch-e2e-tests[#7](https://github.com/algolia/instantsearch.js/issues/7)) ([d760270](https://github.com/algolia/instantsearch.js/commit/d760270c7140e3240ef885ff183a624385bd7424))
* **setSearchBoxValue:** reset searchbox before editing (algolia/instantsearch-e2e-tests[#15](https://github.com/algolia/instantsearch.js/issues/15)) ([ae5b04e](https://github.com/algolia/instantsearch.js/commit/ae5b04e496803ab62ddc5e8b105761fb9ecd5968)), closes [/app.saucelabs.com/tests/4518f96fdfd447e998786d0ff463658a#54](https://github.com//app.saucelabs.com/tests/4518f96fdfd447e998786d0ff463658a/issues/54)
* **spec:** fix Internet Explorer 11 compatibility for test on brand and query filtering ([0661053](https://github.com/algolia/instantsearch.js/commit/06610537a88cbf9a2fe619f9edb626ea0afb63ff))
* **spec:** fix price-range spec to match new slider behavior (algolia/instantsearch-e2e-tests[#8](https://github.com/algolia/instantsearch.js/issues/8)) ([e361d04](https://github.com/algolia/instantsearch.js/commit/e361d0401528e848edfaccd9fe474eea2982c262))
* **spec:** fix specs to match fixed slider behavior (algolia/instantsearch-e2e-tests[#10](https://github.com/algolia/instantsearch.js/issues/10)) ([e85a1f6](https://github.com/algolia/instantsearch.js/commit/e85a1f6f0b2803c84bd088dac2a927ecbfdc6e87))
* **spec:** fix stale element reference exceptions ([f9b77cc](https://github.com/algolia/instantsearch.js/commit/f9b77cc5d975a5c375d07b047836f89a6f7fa90a))
* **spec:** improve specs reliability to minimize flakyness (algolia/instantsearch-e2e-tests[#21](https://github.com/algolia/instantsearch.js/issues/21)) ([4b94600](https://github.com/algolia/instantsearch.js/commit/4b94600cc34abf7f7e4121c380423a2d28020edd))
* **spec:** reduce flakiness related to range slider manipulation (algolia/instantsearch-e2e-tests[#33](https://github.com/algolia/instantsearch.js/issues/33)) ([b241595](https://github.com/algolia/instantsearch.js/commit/b241595e7d652e62c09f45155805c59d83f75942))
* **spec:** wait for the browser to be maximized before running the test on brand an query filtering ([0c62851](https://github.com/algolia/instantsearch.js/commit/0c628514e687a5e8990d8fa3183392472b8c6c07))
* **test:** change InstantSearch.js test branch to `master` (algolia/instantsearch-e2e-tests[#19](https://github.com/algolia/instantsearch.js/issues/19)) ([d9a4b0e](https://github.com/algolia/instantsearch.js/commit/d9a4b0e86933ad4ad7b8bc284d1ea23928bf4b70))
* **typescript:** fix TypeScript configuration to transpile tests when in node_modules ([3b11705](https://github.com/algolia/instantsearch.js/commit/3b11705feb1fd91224eb8b391105bd68c3dfe6f6))
* **webdriverio:** fix mount paths for static server so rewritten urls works ([51d9501](https://github.com/algolia/instantsearch.js/commit/51d9501f6e0336438c98c0a32dfefd7346368694))


### Features

* generate junit test reports by default with saucelabs (algolia/instantsearch-e2e-tests[#29](https://github.com/algolia/instantsearch.js/issues/29)) ([7ae9978](https://github.com/algolia/instantsearch.js/commit/7ae99784512318b77826ad39e8e4ac96907c9d8a))
* **helper:** add changeToggleRefinementStatus helper ([a934934](https://github.com/algolia/instantsearch.js/commit/a934934180540472d662a77f14e33be7c74e1a64))
* **helper:** add clearRefinements helper ([256213d](https://github.com/algolia/instantsearch.js/commit/256213dc789d46db10061055d60fc15264a58801))
* **helper:** add getHitsPerPage helper ([ce71100](https://github.com/algolia/instantsearch.js/commit/ce71100b5cbf740758a4ccad8e26719d14983aa7))
* **helper:** add getHitsTitles helper ([8109f27](https://github.com/algolia/instantsearch.js/commit/8109f27c4cc13ed4af66d10f477e12ff75abbc6b))
* **helper:** add getPage helper ([50de2a1](https://github.com/algolia/instantsearch.js/commit/50de2a1364bb02fb9e9b1b7487cae8bc612f640d))
* **helper:** add getRangeSliderLowerBound helper ([9321ff6](https://github.com/algolia/instantsearch.js/commit/9321ff6c377ce708c80395f81a947c4ef9be7a92))
* **helper:** add getRangeSliderUpperBound helper ([2c74e3d](https://github.com/algolia/instantsearch.js/commit/2c74e3dee68627bec3994642b08bc53001db3d82))
* **helper:** add getRatingMenuValue helper ([3d7e48a](https://github.com/algolia/instantsearch.js/commit/3d7e48aed529fabe92833de325f587326d1d93d3))
* **helper:** add getSearchBoxValue helper ([46f6ad0](https://github.com/algolia/instantsearch.js/commit/46f6ad0fb5125bed2b90cee00fce60093d24dbaa))
* **helper:** add getSelectedHierarchicalMenuItems helper ([102a857](https://github.com/algolia/instantsearch.js/commit/102a857bba837acd4f48ed2044b4aadc6239d519))
* **helper:** add getSelectedRefinementListItem helper ([5856371](https://github.com/algolia/instantsearch.js/commit/585637127ebf9b9ce39599ae0c8698c9717131eb))
* **helper:** add getSortByValue helper ([d68d662](https://github.com/algolia/instantsearch.js/commit/d68d662dfabb089e91ad3ac8179707b6e4193c7c))
* **helper:** add getTextFromElements helper ([84ba6a9](https://github.com/algolia/instantsearch.js/commit/84ba6a9eff3b7b7b87ddbe8759a06a8df6fda6ae))
* **helper:** add getToggleRefinementStatus helper ([fa431f3](https://github.com/algolia/instantsearch.js/commit/fa431f397b2b6c2b16eb07fbb1b8098c2a3ca2af))
* **helper:** add setHitsPerPage helper ([79d966f](https://github.com/algolia/instantsearch.js/commit/79d966fbf1b9ae553863c33f8d05c1d28413e5a1))
* **helper:** add setNextPage helper ([d065ca8](https://github.com/algolia/instantsearch.js/commit/d065ca88373989f5516df0e84f15a7481167686c))
* **helper:** add setPage helper ([c971e2c](https://github.com/algolia/instantsearch.js/commit/c971e2ca1740f662c42c57caaacc7c2c6c2efa27))
* **helper:** add setPreviousPage helper ([34ba545](https://github.com/algolia/instantsearch.js/commit/34ba5456ce641cf92caae7c301bd6ed689f4c474))
* **helper:** add setRangeSliderLowerBound helper ([4a900be](https://github.com/algolia/instantsearch.js/commit/4a900be311d9c8e8a2dd8702d33c7f699f191f7b))
* **helper:** add setRangeSliderUpperBound helper ([700e0c0](https://github.com/algolia/instantsearch.js/commit/700e0c09b6b0d8e050f512375491a60ca418b118))
* **helper:** add setRatingMenuValue helper ([b1e415c](https://github.com/algolia/instantsearch.js/commit/b1e415ce7ff30245994dc2d160b75f05490f3066))
* **helper:** add setSearchBoxValue helper ([f3dcab9](https://github.com/algolia/instantsearch.js/commit/f3dcab928228ededf98f3c63918e952eeee56514))
* **helper:** add setSelectedHierarchicalMenuItem helper ([b54169b](https://github.com/algolia/instantsearch.js/commit/b54169b1c69efd0b3c8e38c75de1d0f56e030c6f))
* **helper:** add setSelectedRefinementListItem helper ([f922cd1](https://github.com/algolia/instantsearch.js/commit/f922cd1e9971f37a0da5920e86113bf527c4b334))
* **helper:** add setSortByValue helper ([a375418](https://github.com/algolia/instantsearch.js/commit/a375418dd0186b06b36ece2d461a879e421722f1))
* **helper:** add waitForElement helper ([1ccf50d](https://github.com/algolia/instantsearch.js/commit/1ccf50d13a7d90f46727c08707683eb76adab5ca))
* **spec:** add custom error messages for timeouts (algolia/instantsearch-e2e-tests[#18](https://github.com/algolia/instantsearch.js/issues/18)) ([7694e43](https://github.com/algolia/instantsearch.js/commit/7694e43b54c20de81f9345d4001d0f309c568986))
* **spec:** add spec for initializing the state from the route (algolia/instantsearch-e2e-tests[#4](https://github.com/algolia/instantsearch.js/issues/4)) ([148d4a8](https://github.com/algolia/instantsearch.js/commit/148d4a8903fe76ee368b102943968452dabbe5bd))
* **spec:** add spec for pagination (algolia/instantsearch-e2e-tests[#2](https://github.com/algolia/instantsearch.js/issues/2)) ([14fb735](https://github.com/algolia/instantsearch.js/commit/14fb7354f119ac2649203ce4add751d0acd0af01))
* **spec:** add spec for search on specific brand and query filtering ([999319e](https://github.com/algolia/instantsearch.js/commit/999319e5bf00917bf3f9f7f8cde774a3f681fc03))
* **spec:** add spec for search on specific category (algolia/instantsearch-e2e-tests[#3](https://github.com/algolia/instantsearch.js/issues/3)) ([07f7e53](https://github.com/algolia/instantsearch.js/commit/07f7e53917d9860b2a84d42a869d34155e119a62))
* **spec:** add spec for search on specific price range ([91de898](https://github.com/algolia/instantsearch.js/commit/91de89888c66d5613ad03c7f41091ff2f804f4d8))
* **tests:** migrate for monorepo ([a089bfb](https://github.com/algolia/instantsearch.js/commit/a089bfbbe5231d83625ee0e52fecb144c1a57079))
* **webdriverio:** add Internet Explorer 11 to the Sauce Labs configuration ([1331cd4](https://github.com/algolia/instantsearch.js/commit/1331cd4232ac8b00a0659432f56f2930f3f23f5b))
* **webdriverio:** add retry for Sauce Connect tunnel (algolia/instantsearch-e2e-tests[#17](https://github.com/algolia/instantsearch.js/issues/17)) ([9a0a1b0](https://github.com/algolia/instantsearch.js/commit/9a0a1b04e80379ee9859d90885c3a926560978c0))
* **webdriverio:** add WebdriverIO local configuration ([62fc93f](https://github.com/algolia/instantsearch.js/commit/62fc93f7260bf3d3479494f9148ddef56a8b6726))
* **webdriverio:** add WebdriverIO Sauce Labs configuration ([a8b41f2](https://github.com/algolia/instantsearch.js/commit/a8b41f23a2c4f684386d9da826cf31805776006f))


### BREAKING CHANGES

* **tests:** this requires the url to be /examples/js/e-commerce instead of /examples/e-commerce. This means that until the package is in the monorepo, its tests wouldn't pass. After the main monorepo PR is merged, this repo will move inside and will no longer be published.
* tested projects now require `@wdio/junit-reporter`.





# 4.0.0 (2022-12-13)



### BREAKING CHANGES

* **tests:** this requires the url to be /examples/js/e-commerce instead of /examples/e-commerce. This means that until the package is in the monorepo, its tests wouldn't pass. After the main monorepo PR is merged, this repo will move inside and will no longer be published.
* tested projects now require `@wdio/junit-reporter`.





## [3.0.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v2.0.1...v2.0.2) (2022-11-23)


### Features

* **tests:** migrate to the InstantSearch monorepo ([#38](https://github.com/algolia/instantsearch-e2e-tests/issues/38))

## [2.0.2](https://github.com/algolia/instantsearch-e2e-tests/compare/v2.0.1...v2.0.2) (2022-02-03)


### Bug Fixes

* **spec:** reduce flakiness related to range slider manipulation ([#33](https://github.com/algolia/instantsearch-e2e-tests/issues/33)) ([a008f38](https://github.com/algolia/instantsearch-e2e-tests/commit/a008f38))



## [2.0.1](https://github.com/algolia/instantsearch-e2e-tests/compare/v2.0.0...v2.0.1) (2022-01-18)


### Bug Fixes

* correctly output junit report in target repository ([#32](https://github.com/algolia/instantsearch-e2e-tests/issues/32)) ([d3e9e1b](https://github.com/algolia/instantsearch-e2e-tests/commit/d3e9e1b))



# [2.0.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.3.0...v2.0.0) (2022-01-17)


### Features

* generate junit test reports by default with saucelabs ([#29](https://github.com/algolia/instantsearch-e2e-tests/issues/29)) ([5f2c0b3](https://github.com/algolia/instantsearch-e2e-tests/commit/5f2c0b3))


### BREAKING CHANGES

* tested projects now require `@wdio/junit-reporter`.



# [1.3.0](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.4...v1.3.0) (2020-04-17)


### Bug Fixes

* **spec:** improve specs reliability to minimize flackyness ([#21](https://github.com/algolia/instantsearch-e2e-tests/issues/21)) ([44bae68](https://github.com/algolia/instantsearch-e2e-tests/commit/44bae68))
* **test:** change InstantSearch.js test branch to `master` ([#19](https://github.com/algolia/instantsearch-e2e-tests/issues/19)) ([1c34d8d](https://github.com/algolia/instantsearch-e2e-tests/commit/1c34d8d))


### Features

* **spec:** add custom error messages for timeouts ([#18](https://github.com/algolia/instantsearch-e2e-tests/issues/18)) ([617a22d](https://github.com/algolia/instantsearch-e2e-tests/commit/617a22d))
* **webdriverio:** add retry for Sauce Connect tunnel ([#17](https://github.com/algolia/instantsearch-e2e-tests/issues/17)) ([9e398c2](https://github.com/algolia/instantsearch-e2e-tests/commit/9e398c2))



## [1.2.4](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.3...v1.2.4) (2019-11-26)


### Bug Fixes

* **setSearchBoxValue:** reset searchbox before editing ([#15](https://github.com/algolia/instantsearch-e2e-tests/issues/15)) ([b52ea34](https://github.com/algolia/instantsearch-e2e-tests/commit/b52ea3468594c86168b155bb0fcab1230ff86672)), closes [/app.saucelabs.com/tests/4518f96fdfd447e998786d0ff463658a#54](https://github.com//app.saucelabs.com/tests/4518f96fdfd447e998786d0ff463658a/issues/54)



## [1.2.3](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.2...v1.2.3) (2019-10-14)


### Bug Fixes

* **helper:** fix helpers to handle RangeSlider in vue-instantsearch ([#12](https://github.com/algolia/instantsearch-e2e-tests/issues/12)) ([143a59b](https://github.com/algolia/instantsearch-e2e-tests/commit/143a59b))



## [1.2.2](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.1...v1.2.2) (2019-09-12)


### Bug Fixes

* **spec:** fix specs to match fixed slider behavior ([#10](https://github.com/algolia/instantsearch-e2e-tests/issues/10)) ([d7bce97](https://github.com/algolia/instantsearch-e2e-tests/commit/d7bce97))



## [1.2.1](https://github.com/algolia/instantsearch-e2e-tests/compare/v1.2.0...v1.2.1) (2019-09-11)


### Bug Fixes

* **helper:** fix helpers to handle RangeSlider in react-instantsearch ([#9](https://github.com/algolia/instantsearch-e2e-tests/issues/9)) ([c2de700](https://github.com/algolia/instantsearch-e2e-tests/commit/c2de700))



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
