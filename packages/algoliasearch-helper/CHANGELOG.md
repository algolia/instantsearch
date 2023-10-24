# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.15.0](https://github.com/algolia/instantsearch/compare/algoliasearch-helper@3.14.2...algoliasearch-helper@3.15.0) (2023-10-24)


### Features

* **instantsearch:** allow the insights middleware to be added in answer to a server setting ([#5883](https://github.com/algolia/instantsearch/issues/5883)) ([2a9e654](https://github.com/algolia/instantsearch/commit/2a9e6542f6ce22d67789febc8a2e1852a0ad7641))





## [3.14.2](https://github.com/algolia/instantsearch/compare/algoliasearch-helper@3.14.1...algoliasearch-helper@3.14.2) (2023-09-19)


### Bug Fixes

* **prettier:** consistent version ([#5850](https://github.com/algolia/instantsearch/issues/5850)) ([ca59c6d](https://github.com/algolia/instantsearch/commit/ca59c6dbd5c9eac4e2e0179a24e39bca997ae141))





## [3.14.1](https://github.com/algolia/instantsearch/compare/algoliasearch-helper@3.14.0...algoliasearch-helper@3.14.1) (2023-09-12)

**Note:** Version bump only for package algoliasearch-helper





# [3.14.0](https://github.com/algolia/instantsearch/compare/algoliasearch-helper@3.13.5...algoliasearch-helper@3.14.0) (2023-07-25)

### Features

- **caching:** sort filters and queries ([#5764](https://github.com/algolia/instantsearch/issues/5764)) ([f3d2019](https://github.com/algolia/instantsearch/commit/f3d2019748512a66c748da5d18750eaffd9e53b9))

## [3.13.5](https://github.com/algolia/instantsearch/compare/algoliasearch-helper@3.13.4...algoliasearch-helper@3.13.5) (2023-07-19)

### Bug Fixes

- **version:** ensure version file/export matches package ([#5762](https://github.com/algolia/instantsearch/issues/5762)) ([eb0bb32](https://github.com/algolia/instantsearch/commit/eb0bb3230735e498cbcb2d5096365534d1fae575))

## [3.13.4](https://github.com/algolia/instantsearch/compare/algoliasearch-helper@3.13.3...algoliasearch-helper@3.13.4) (2023-07-18)

**Note:** Version bump only for package algoliasearch-helper

## [3.13.3](https://github.com/algolia/algoliasearch-helper-js/compare/3.13.2...3.13.3) (2023-06-21)

### Bug Fixes

- **getFacetValues:** ignore `rootPath` for hierarchical facets ([#949](https://github.com/algolia/algoliasearch-helper-js/issues/949)) ([deb5daf](https://github.com/algolia/algoliasearch-helper-js/commit/deb5dafbe7ffb2c53d7c227ae236592ec9a9e02d))

## [3.13.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.13.1...3.13.2) (2023-06-14)

### Bug Fixes

- **types:** improve conditional for client version ([#943](https://github.com/algolia/algoliasearch-helper-js/issues/943)) ([6c22185](https://github.com/algolia/algoliasearch-helper-js/commit/6c2218508361c8a4130426a22ac4302328ba86ad))

## [3.13.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.13.0...3.13.1) (2023-06-12)

### Bug Fixes

- **SearchResults:** use empty facets object for exclusion when results are artificial ([#940](https://github.com/algolia/algoliasearch-helper-js/issues/940)) ([a51e8cb](https://github.com/algolia/algoliasearch-helper-js/commit/a51e8cb37e10c41ca816be1630bab2078980947b))

# [3.13.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.12.0...3.13.0) (2023-05-03)

### Features

- **DerivedHelper:** skip request for empty index ([#938](https://github.com/algolia/algoliasearch-helper-js/issues/938)) ([79caa4b](https://github.com/algolia/algoliasearch-helper-js/commit/79caa4b0ca2537c0f4431ee11556464031935436))

# [3.12.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.11.3...3.12.0) (2023-03-03)

### Features

- **types:** add `queryAfterRemoval` to `SearchResults` ([#934](https://github.com/algolia/algoliasearch-helper-js/issues/934)) ([4fb5a03](https://github.com/algolia/algoliasearch-helper-js/commit/4fb5a0345f0cf438fb026d8010faf843bd3b0a01))

## [3.11.3](https://github.com/algolia/algoliasearch-helper-js/compare/3.11.2...3.11.3) (2023-01-23)

### Bug Fixes

- **getFacetValues:** reflect the value of \_state in hierarchicalFacetValues ([#925](https://github.com/algolia/algoliasearch-helper-js/issues/925)) ([4d093b4](https://github.com/algolia/algoliasearch-helper-js/commit/4d093b464e62dc6963dc6676aee19ff78145f48a))

## [3.11.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.11.1...3.11.2) (2023-01-09)

### Bug Fixes

- **answers:** deprecate findAnswers ([#919](https://github.com/algolia/algoliasearch-helper-js/issues/919)) ([0711861](https://github.com/algolia/algoliasearch-helper-js/commit/07118610d3da07d04390d7b79e857122e98a3db5))
- prevent prototype pollution in rare error-cases ([#923](https://github.com/algolia/algoliasearch-helper-js/issues/923)) ([7ae16ea](https://github.com/algolia/algoliasearch-helper-js/commit/7ae16eaa3f5732b96f1fa40973778c5494e77b89)), closes [#922](https://github.com/algolia/algoliasearch-helper-js/issues/922) [#880](https://github.com/algolia/algoliasearch-helper-js/issues/880)

### Features

- update Algolia logo ([#918](https://github.com/algolia/algoliasearch-helper-js/issues/918)) ([58e0e58](https://github.com/algolia/algoliasearch-helper-js/commit/58e0e588195dde8f411383ad248bd112a9c01eb5))

## [3.11.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.11.0...3.11.1) (2022-09-12)

### Bug Fixes

- **facetValues:** use existing facet filters in multi queries for hierarchical facet values ([#915](https://github.com/algolia/algoliasearch-helper-js/issues/915)) ([bae388c](https://github.com/algolia/algoliasearch-helper-js/commit/bae388c7143653e74628dbd3c72979a51be6ab7f))

# [3.11.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.10.0...3.11.0) (2022-08-03)

### Features

- **typing:** Update SearchResults hits, expose optional hit typings ([#914](https://github.com/algolia/algoliasearch-helper-js/issues/914)) ([bf4c4c6](https://github.com/algolia/algoliasearch-helper-js/commit/bf4c4c6cdc84a5b9d8daff60d591a419df01beed))

# [3.10.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.9.0...3.10.0) (2022-06-27)

### Features

- **disjunctiveFacetParams:** reduce payload size ([#912](https://github.com/algolia/algoliasearch-helper-js/issues/912)) ([9518575](https://github.com/algolia/algoliasearch-helper-js/commit/95185750fb05e82c06d3ddd9e907f06ce66d0317))
- **types:** support algoliasearch v5 ([#910](https://github.com/algolia/algoliasearch-helper-js/issues/910)) ([524272a](https://github.com/algolia/algoliasearch-helper-js/commit/524272a2fe62c852d9ed8d0cd698cc184897b9c5))

# [3.9.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.8.3...3.9.0) (2022-06-20)

### Bug Fixes

- **requests:** send a sorted object of parameters ([#911](https://github.com/algolia/algoliasearch-helper-js/issues/911)) ([832507f](https://github.com/algolia/algoliasearch-helper-js/commit/832507fae48c54ab41d3241254753100bb86910b))

### Features

- **searchForFacetValues:** fall back to client.search if it's present ([#906](https://github.com/algolia/algoliasearch-helper-js/issues/906)) ([d9ebb01](https://github.com/algolia/algoliasearch-helper-js/commit/d9ebb01382ec83e0c579c393c3e9df83a9261699)), closes [/github.com/algolia/algoliasearch-client-javascript/blob/v3/src/AlgoliaSearchCore.js#L638-L654](https://github.com//github.com/algolia/algoliasearch-client-javascript/blob/v3/src/AlgoliaSearchCore.js/issues/L638-L654)

## [3.8.3](https://github.com/algolia/algoliasearch-helper-js/compare/3.8.2...3.8.3) (2022-06-15)

### Bug Fixes

- **facetValues:** retrieve all hierarchical facet parent values ([#908](https://github.com/algolia/algoliasearch-helper-js/issues/908)) ([420111b](https://github.com/algolia/algoliasearch-helper-js/commit/420111b29f82fe3af8e5861a977f024a61f4025f))

## [3.8.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.8.1...3.8.2) (2022-04-08)

### Bug Fixes

- **types:** correct type for addTag ([#903](https://github.com/algolia/algoliasearch-helper-js/issues/903)) ([ca82ef3](https://github.com/algolia/algoliasearch-helper-js/commit/ca82ef302ceff8e0e31767c90e2f272914c703af))

## [3.8.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.8.0...3.8.1) (2022-04-05)

### Bug Fixes

- **disjunctiveFacets:** avoid escaping non-string values ([#902](https://github.com/algolia/algoliasearch-helper-js/issues/902)) ([4ac67bd](https://github.com/algolia/algoliasearch-helper-js/commit/4ac67bda2a8e5a2b8c53c960637b72a77951af76))

# [3.8.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.7.4...3.8.0) (2022-04-04)

### Features

- **facetValues:** offer escaped value ([#889](https://github.com/algolia/algoliasearch-helper-js/issues/889)) ([4bae51b](https://github.com/algolia/algoliasearch-helper-js/commit/4bae51bdefd217f3ef9ab9bf02fb653f3b8ae643)), closes [#900](https://github.com/algolia/algoliasearch-helper-js/issues/900) [#901](https://github.com/algolia/algoliasearch-helper-js/issues/901)

## [3.7.4](https://github.com/algolia/algoliasearch-helper-js/compare/3.7.3...3.7.4) (2022-03-21)

### Bug Fixes

- **type:** implement correctly ([1c8670b](https://github.com/algolia/algoliasearch-helper-js/commit/1c8670b21a507024d2ddf797feae5bb15343c244))

## [3.7.3](https://github.com/algolia/algoliasearch-helper-js/compare/3.7.2...3.7.3) (2022-03-18)

### Bug Fixes

- **ts:** remove stray comment ([24fe8de](https://github.com/algolia/algoliasearch-helper-js/commit/24fe8de4bebc74500b33c95b124500b8499ef588))

## [3.7.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.7.1...3.7.2) (2022-03-18)

### Bug Fixes

- **results:** implement search result options via an argument ([4e6ac69](https://github.com/algolia/algoliasearch-helper-js/commit/4e6ac6926bd284c7eafe060480fc4258844d121a))

## [3.7.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.7.0...3.7.1) (2022-03-17)

### Bug Fixes

- **types:** allow "\_\_isArtificial" ([#890](https://github.com/algolia/algoliasearch-helper-js/issues/890)) ([1e2aef0](https://github.com/algolia/algoliasearch-helper-js/commit/1e2aef0fb8aa88c80b985ef009bff5a3dd71ca80))

# [3.7.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.6.2...3.7.0) (2021-12-13)

### Features

- **events:** move to @algolia/events ([#883](https://github.com/algolia/algoliasearch-helper-js/issues/883)) ([0c33fdc](https://github.com/algolia/algoliasearch-helper-js/commit/0c33fdc0063d7486db71ba0c6952339dc8b93ae5))

## [3.6.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.6.1...3.6.2) (2021-10-19)

### Bug Fixes

- **SearchParameters:** ignore invalid parameters ([#880](https://github.com/algolia/algoliasearch-helper-js/issues/880)) ([4ff542b](https://github.com/algolia/algoliasearch-helper-js/commit/4ff542b70b92a6b81cce8b9255700b0bc0817edd))

## [3.6.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.6.0...3.6.1) (2021-10-15)

### Bug Fixes

- **facetOrdering:** make sure ordered facets is a dense array ([#879](https://github.com/algolia/algoliasearch-helper-js/issues/879)) ([990f8bc](https://github.com/algolia/algoliasearch-helper-js/commit/990f8bc133dd379c457c52f750a87944e2f2924c))

# [3.6.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.5.5...3.6.0) (2021-10-08)

### Features

- **facets:** when \* is present, only send that parameter ([#874](https://github.com/algolia/algoliasearch-helper-js/issues/874)) ([fc183ec](https://github.com/algolia/algoliasearch-helper-js/commit/fc183ec2910d4ba33067b3487f3a70e940fd24d3))

## [3.5.5](https://github.com/algolia/algoliasearch-helper-js/compare/3.5.4...3.5.5) (2021-07-30)

### Features

- **ts:** allow showParentLevel in hierarchicalFacet ([cef547d](https://github.com/algolia/algoliasearch-helper-js/commit/cef547d8f48bf2cdb2d28476f8d3715c1b1a40d8))

## [3.5.4](https://github.com/algolia/algoliasearch-helper-js/compare/3.5.3...3.5.4) (2021-07-05)

### Bug Fixes

- **facetOrdering:** facetOrdering.facets, not facetOrdering.facet ([97d769a](https://github.com/algolia/algoliasearch-helper-js/commit/97d769adf68458a04605ca7ac0e35ade5c4bc646))

## [3.5.3](https://github.com/algolia/algoliasearch-helper-js/compare/3.5.2...3.5.3) (2021-06-14)

### Bug Fixes

- **ts:** correct required for getFacetValues ([55a909f](https://github.com/algolia/algoliasearch-helper-js/commit/55a909fe1ef892b3e76ddc109155336c77875292))

## [3.5.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.5.1...3.5.2) (2021-06-14)

### Bug Fixes

- **facetOrdering:** hierarchical attributes sort by path ([c1d9764](https://github.com/algolia/algoliasearch-helper-js/commit/c1d9764b7ed9492356a8b9ccfdb980fe0361c46f))

## [3.5.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.5.0...3.5.1) (2021-06-14)

### Bug Fixes

- **ts:** correctly optional renderingContent ([41d27f8](https://github.com/algolia/algoliasearch-helper-js/commit/41d27f8336f48dd2eaec53afafcceb81a58d0dfb))

# [3.5.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.4.5...3.5.0) (2021-06-14)

### Features

- **getFacetValues:** process facetOrdering ([#822](https://github.com/algolia/algoliasearch-helper-js/issues/822)) ([8c7ff44](https://github.com/algolia/algoliasearch-helper-js/commit/8c7ff444407cc7855c4d76b15954f4a6864d0b5d))

## [3.4.5](https://github.com/algolia/algoliasearch-helper-js/compare/3.4.4...3.4.5) (2021-06-10)

### Features

- **ts:** document renderingContent ([#823](https://github.com/algolia/algoliasearch-helper-js/issues/823)) ([7b176a7](https://github.com/algolia/algoliasearch-helper-js/commit/7b176a7bbc38de193ac1c6a34dacde63059e4b3b))

## [3.4.4](https://github.com/algolia/algoliasearch-helper-js/compare/3.4.3...3.4.4) (2021-02-16)

### Bug Fixes

- **ts:** add rootPath to HierarchicalFacet ([06fb959](https://github.com/algolia/algoliasearch-helper-js/commit/06fb959f119cc0e7b91268154c01e0f6f4aa3ba1))

## [3.4.3](https://github.com/algolia/algoliasearch-helper-js/compare/3.4.2...3.4.3) (2021-02-15)

### Bug Fixes

- **ts:** correct type for HierarchicalFacet parameter ([#811](https://github.com/algolia/algoliasearch-helper-js/issues/811)) ([3b705dd](https://github.com/algolia/algoliasearch-helper-js/commit/3b705dd4b22aa57c0ecd6533ea515fdafa7fd5f9)), closes [/github.com/algolia/instantsearch/blob/1ede1ae392d3a12f5b0fe29075ffeb05e572a874/src/connectors/menu/connectMenu.js#L283-L286](https://github.com//github.com/algolia/instantsearch/blob/1ede1ae392d3a12f5b0fe29075ffeb05e572a874/src/connectors/menu/connectMenu.js/issues/L283-L286) [/github.com/algolia/instantsearch/blob/1ede1ae392d3a12f5b0fe29075ffeb05e572a874/src/connectors/menu/**tests**/connectMenu-test.js#L98-L101](https://github.com//github.com/algolia/instantsearch/blob/1ede1ae392d3a12f5b0fe29075ffeb05e572a874/src/connectors/menu/__tests__/connectMenu-test.js/issues/L98-L101)

## [3.4.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.4.1...3.4.2) (2021-02-10)

### Bug Fixes

- **types:** add relevancyStrictness to SearchParameters ([#810](https://github.com/algolia/algoliasearch-helper-js/issues/810)) ([3860179](https://github.com/algolia/algoliasearch-helper-js/commit/3860179c63c31bce0df82337d4000c7449ef516a))

## [3.4.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.4.0...3.4.1) (2021-02-10)

### Bug Fixes

- **ts:** add types for smart sort ([#809](https://github.com/algolia/algoliasearch-helper-js/issues/809)) ([236822e](https://github.com/algolia/algoliasearch-helper-js/commit/236822e0f041ecb2e926740cff7e6ecdadccc604))
- **ts:** make queryID optional ([#806](https://github.com/algolia/algoliasearch-helper-js/issues/806)) ([67ad89b](https://github.com/algolia/algoliasearch-helper-js/commit/67ad89bace2b3795a4d4281f97b4edf557b6903d))

# [3.4.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.3.4...3.4.0) (2021-01-12)

### Features

- **answers:** add `findAnswers` ([#804](https://github.com/algolia/algoliasearch-helper-js/issues/804)) ([4635dd5](https://github.com/algolia/algoliasearch-helper-js/commit/4635dd5b911713be7d2a868a79f9150b7bd175bd))

## [3.3.4](https://github.com/algolia/algoliasearch-helper-js/compare/3.3.3...3.3.4) (2020-12-09)

### Bug Fixes

- ignore invalid userToken ([#802](https://github.com/algolia/algoliasearch-helper-js/issues/802)) ([a2876c5](https://github.com/algolia/algoliasearch-helper-js/commit/a2876c59fb7bdf7bd564c727bc70e7514362e189))

## [3.3.3](https://github.com/algolia/algoliasearch-helper-js/compare/3.3.2...3.3.3) (2020-12-02)

### Bug Fixes

- **removeNumericRefinement:** clear empty refinements ([#801](https://github.com/algolia/algoliasearch-helper-js/issues/801)) ([844f7d7](https://github.com/algolia/algoliasearch-helper-js/commit/844f7d787de4897f17ebd5982f20316d7cb75a7d))

## [3.3.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.3.1...3.3.2) (2020-11-19)

### Bug Fixes

- **ts:** add queryLanguages to parameters ([51f5448](https://github.com/algolia/algoliasearch-helper-js/commit/51f544855a38031e36c70e3c9b2212446cc4a1fa))
- **ts:** add searchWithoutTriggeringOnStateChange ([fb91e27](https://github.com/algolia/algoliasearch-helper-js/commit/fb91e277325fa7c6c534370323dc2bdaee590b6d))
- **ts:** correct type for clearCache ([684d5c0](https://github.com/algolia/algoliasearch-helper-js/commit/684d5c02f54de51512c282117c70d86cf09ba098))
- **ts:** detailed type for facet.stats ([234cb19](https://github.com/algolia/algoliasearch-helper-js/commit/234cb19d0f8bf98a490b8e3d9042c9e0317b69e7))

## [3.3.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.3.0...3.3.1) (2020-11-19)

### Bug Fixes

- **setup:** run postinstall only locally ([9df09e4](https://github.com/algolia/algoliasearch-helper-js/commit/9df09e465a3fff44bc3737b6660a076df0aebeec))

# [3.3.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.2.2...3.3.0) (2020-11-19)

### Bug Fixes

- **ts:** correct type for getNumericRefinements ([#800](https://github.com/algolia/algoliasearch-helper-js/issues/800)) ([0920d94](https://github.com/algolia/algoliasearch-helper-js/commit/0920d945b09134b0b2ef7e5ccf7a71947504f9f0))

### Features

- **ts:** fill in more of the types ([34ae5cd](https://github.com/algolia/algoliasearch-helper-js/commit/34ae5cd58977fa3c935ae74aa43b5049c9e6a6f9))

## [3.2.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.2.1...3.2.2) (2020-07-30)

### Bug Fixes

- **insideBoundingBox:** prevent invalid parameter from throwing ([#787](https://github.com/algolia/algoliasearch-helper-js/issues/787)) ([ba5ef68](https://github.com/algolia/algoliasearch-helper-js/commit/ba5ef685a4263cba154de30e2b1bd335fe5982e2))
- **ts:** use a dedicated key to determine client version ([#789](https://github.com/algolia/algoliasearch-helper-js/issues/789)) ([deb4f4f](https://github.com/algolia/algoliasearch-helper-js/commit/deb4f4fa1f154fb7c437b5c7352bb9f5ca39b2bd))

## [3.2.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.2.0...3.2.1) (2020-07-23)

### Bug Fixes

- **defaultsPure:** fix the regression where the order was wrong with addFacetRefinement ([#786](https://github.com/algolia/algoliasearch-helper-js/issues/786)) ([b54fddb](https://github.com/algolia/algoliasearch-helper-js/commit/b54fddb9196b2dc19b6c259306262f2e1da2cf78))

# [3.2.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.1.2...3.2.0) (2020-07-21)

### Bug Fixes

- accept all fields implicitly instead of the allow list ([#779](https://github.com/algolia/algoliasearch-helper-js/issues/779)) ([89a7aab](https://github.com/algolia/algoliasearch-helper-js/commit/89a7aab6d0189fcc963832e418399aad98c159ec))

## [3.1.2](https://github.com/algolia/algoliasearch-helper-js/compare/3.1.1...3.1.2) (2020-06-02)

### Bug Fixes

- **defaultsPure:** don't change keys order, fix [#761](https://github.com/algolia/algoliasearch-helper-js/issues/761) ([#762](https://github.com/algolia/algoliasearch-helper-js/issues/762)) ([6b835ff](https://github.com/algolia/algoliasearch-helper-js/commit/6b835ffd07742f2d6b314022cce6848f5cfecd4a))
- **types:** add `resetPage` state method ([#773](https://github.com/algolia/algoliasearch-helper-js/issues/773)) ([e2a88a1](https://github.com/algolia/algoliasearch-helper-js/commit/e2a88a169d3b82f4fd756cb4b0e9317d5bcc6b9e))
- **typescript:** fix TypeScript 3.9 compatibility ([#775](https://github.com/algolia/algoliasearch-helper-js/issues/775)) ([c83c501](https://github.com/algolia/algoliasearch-helper-js/commit/c83c501938e803ca9fa74601dcd1ed896583ac0e)), closes [#774](https://github.com/algolia/algoliasearch-helper-js/issues/774)

## [3.1.1](https://github.com/algolia/algoliasearch-helper-js/compare/3.1.0...3.1.1) (2020-02-21)

### Bug Fixes

- fix omit calls to pass excluded value as an array ([#760](https://github.com/algolia/algoliasearch-helper-js/issues/760)) ([dd375ab](https://github.com/algolia/algoliasearch-helper-js/commit/dd375ab18513336817bd8d5d78341ac33ae94954))

# [3.1.0](https://github.com/algolia/algoliasearch-helper-js/compare/3.0.0...3.1.0) (2020-01-21)

### Bug Fixes

- **types:** add `optionalFilters` search parameter ([#754](https://github.com/algolia/algoliasearch-helper-js/issues/754)) ([faba4d7](https://github.com/algolia/algoliasearch-helper-js/commit/faba4d7f52abae1c18f1023a03c41cfb5cffefb0))

### Features

- **algoliasearch:** add support for algoliasearch v4 the helper v3 ([#756](https://github.com/algolia/algoliasearch-helper-js/issues/756)) ([67407a0](https://github.com/algolia/algoliasearch-helper-js/commit/67407a0dfd99402bc1a77bd005385633c3881624))

# [3.0.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.28.0...3.0.0) (2019-11-18)

### Bug Fixes

- **defaults:** remove const ([48a0c48](https://github.com/algolia/algoliasearch-helper-js/commit/48a0c488a966c02230caf51c07e20b5cbf7a10d0))
- **errors:** remove isRefined ([#731](https://github.com/algolia/algoliasearch-helper-js/issues/731)) ([5761885](https://github.com/algolia/algoliasearch-helper-js/commit/5761885f9b2f1f505d27cfce7f3845a0d5a7bbba))
- **getConjunctiveRefinements:** no error when requested facet is not conjunctive ([#724](https://github.com/algolia/algoliasearch-helper-js/issues/724)) ([cf852e7](https://github.com/algolia/algoliasearch-helper-js/commit/cf852e7d8741f2a7f675deacaf0c4f6d3cc0ad4f)), closes [#722](https://github.com/algolia/algoliasearch-helper-js/issues/722)
- **getDisjunctiveRefinements:** remove error ([#725](https://github.com/algolia/algoliasearch-helper-js/issues/725)) ([211e390](https://github.com/algolia/algoliasearch-helper-js/commit/211e390fd73b0fedecded5e64f29630c44fa15e5)), closes [#722](https://github.com/algolia/algoliasearch-helper-js/issues/722)
- **getExcludeRefinements:** replace error by default value ([#726](https://github.com/algolia/algoliasearch-helper-js/issues/726)) ([9d7ae87](https://github.com/algolia/algoliasearch-helper-js/commit/9d7ae871d6b4bec9117e69b90fc7bfa53e6cb3c1))
- **getFacetStats:** remove error ([#721](https://github.com/algolia/algoliasearch-helper-js/issues/721)) ([96b6ec8](https://github.com/algolia/algoliasearch-helper-js/commit/96b6ec8552289eca0ac484c04b303fe2c8bc1af8)), closes [#720](https://github.com/algolia/algoliasearch-helper-js/issues/720)
- **getFacetValues:** don't throw error when there's no facet ([#720](https://github.com/algolia/algoliasearch-helper-js/issues/720)) ([e15e39e](https://github.com/algolia/algoliasearch-helper-js/commit/e15e39e88c7599b8ff92754fdee86d5ba4a1e44f))
- **getHierarchicalFacetBreadcrumb:** don't throw an error ([#723](https://github.com/algolia/algoliasearch-helper-js/issues/723)) ([40e1d61](https://github.com/algolia/algoliasearch-helper-js/commit/40e1d61eba366bbfece5945c1693bc04d21427e4))
- **isDisjunctiveFacetRefined:** return false if not in disjunctiveFacets ([#729](https://github.com/algolia/algoliasearch-helper-js/issues/729)) ([13ec09b](https://github.com/algolia/algoliasearch-helper-js/commit/13ec09bff8bbefcc1ad3200cd196c8832c816eca)), closes [#727](https://github.com/algolia/algoliasearch-helper-js/issues/727)
- **isExcludeRefined:** remove error in favor of false ([#728](https://github.com/algolia/algoliasearch-helper-js/issues/728)) ([3f0ab6b](https://github.com/algolia/algoliasearch-helper-js/commit/3f0ab6b4800181d4b20ac9dae856ed480ef90001)), closes [#727](https://github.com/algolia/algoliasearch-helper-js/issues/727)
- **isFacetRefined:** return false if facet isn't declared ([#727](https://github.com/algolia/algoliasearch-helper-js/issues/727)) ([7151f56](https://github.com/algolia/algoliasearch-helper-js/commit/7151f56e4be9e71ef8b1427b2746f11b1edfb2f8))
- **isHierarchicalFacetRefined:** return false if refinement isn't a facet ([#730](https://github.com/algolia/algoliasearch-helper-js/issues/730)) ([89fa010](https://github.com/algolia/algoliasearch-helper-js/commit/89fa01087201290b4d26aa6a0780d0b505d17622)), closes [#722](https://github.com/algolia/algoliasearch-helper-js/issues/722)
- **lodash/intersection:** replace with custom implementation ([#718](https://github.com/algolia/algoliasearch-helper-js/issues/718)) ([00dfb4e](https://github.com/algolia/algoliasearch-helper-js/commit/00dfb4e67fc3b343ec96321b1cb5dd527d074419)), closes [#696](https://github.com/algolia/algoliasearch-helper-js/issues/696)
- **removeXFacet:** make sure this fully removes empty arrays ([#743](https://github.com/algolia/algoliasearch-helper-js/issues/743)) ([ea5a22a](https://github.com/algolia/algoliasearch-helper-js/commit/ea5a22a8afd64d9c68279a4aff284a1a5c023835))
- **results:** remove lodash looping over objects ([#648](https://github.com/algolia/algoliasearch-helper-js/issues/648)) ([bb025c2](https://github.com/algolia/algoliasearch-helper-js/commit/bb025c27aa1af7c31763970151f90b7bb401b164)), closes [#258](https://github.com/algolia/algoliasearch-helper-js/issues/258) [#651](https://github.com/algolia/algoliasearch-helper-js/issues/651)
- **sortBy:** compare whole prefix instead of first character ([#702](https://github.com/algolia/algoliasearch-helper-js/issues/702)) ([b85fb50](https://github.com/algolia/algoliasearch-helper-js/commit/b85fb502ea48d0142a1400887bf353645ab5fbda)), closes [/github.com/algolia/algoliasearch-helper-js/pull/690#discussion_r282467917](https://github.com//github.com/algolia/algoliasearch-helper-js/pull/690/issues/discussion_r282467917)
- **toggleRefinement:** keep an empty array when clearing ([#738](https://github.com/algolia/algoliasearch-helper-js/issues/738)) ([5b3fc11](https://github.com/algolia/algoliasearch-helper-js/commit/5b3fc1189c93c480b3de5cdd0e37c8b86edfb89a))
- **types:** add state.removeNumericRefinement ([#742](https://github.com/algolia/algoliasearch-helper-js/issues/742)) ([e58c24a](https://github.com/algolia/algoliasearch-helper-js/commit/e58c24ab5a858698ef27bd50c9f2d7ee93d6dd53))

### Features

- **getState:** remove "filter" option ([#707](https://github.com/algolia/algoliasearch-helper-js/issues/707)) ([ac52791](https://github.com/algolia/algoliasearch-helper-js/commit/ac527915fee3dfaf29dce26fcedb5a8c7e2007b7))
- **getState:** remove getState ([#708](https://github.com/algolia/algoliasearch-helper-js/issues/708)) ([7de698c](https://github.com/algolia/algoliasearch-helper-js/commit/7de698cfa9fa9518e3a40cdb2caa34da7e9ba52e))
- implement dedicated reset page method ([#673](https://github.com/algolia/algoliasearch-helper-js/issues/673)) ([666501e](https://github.com/algolia/algoliasearch-helper-js/commit/666501eb4149c1f0558ef1cdeb8239fc1bdc2d2f))
- **requestBuilder:** prevent needless extra requests for empty refinements ([#737](https://github.com/algolia/algoliasearch-helper-js/issues/737)) ([db0a392](https://github.com/algolia/algoliasearch-helper-js/commit/db0a3929ab236f0435a81544ca721dd6b9f9319a))
- **search:** allow the search only with Derived Helpers ([#704](https://github.com/algolia/algoliasearch-helper-js/issues/704)) ([aa128fc](https://github.com/algolia/algoliasearch-helper-js/commit/aa128fc928a999438b8efaad050170f812f85b33))
- **SearchParameters:** avoid undefined values ([#703](https://github.com/algolia/algoliasearch-helper-js/issues/703)) ([9757e0a](https://github.com/algolia/algoliasearch-helper-js/commit/9757e0a78d8e6fec64999e45d4452019d4a13a8f))
- **typescript:** move typings inline ([#719](https://github.com/algolia/algoliasearch-helper-js/issues/719)) ([a12272e](https://github.com/algolia/algoliasearch-helper-js/commit/a12272ead5ba87b32c1b8528deeeae555ace26e3)), closes [/github.com/algolia/algoliasearch-helper-js/pull/719/files#r301510978](https://github.com//github.com/algolia/algoliasearch-helper-js/pull/719/files/issues/r301510978) [/github.com/algolia/algoliasearch-helper-js/pull/719#commitcomment-34233548](https://github.com//github.com/algolia/algoliasearch-helper-js/pull/719/issues/commitcomment-34233548)

### BREAKING CHANGES

- **errors:** removed helper.isRefined, use helper.hasRefinements instead
- **getState:** use helper.state instead of helper.getState()
- **getState:** getState(filters) is replaced my manually filtering the returned object
- **getState:** SearchParameters.filter is removed

- doc(filter): remove reference

# [2.28.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.26.1...2.28.0) (2019-05-07)

### Bug Fixes

- **ua:** change the User-Agent to use the new specs lib (version) ([#647](https://github.com/algolia/algoliasearch-helper-js/issues/647)) ([eafd4cf](https://github.com/algolia/algoliasearch-helper-js/commit/eafd4cfd3e78b49bb5425784bab413f0702cbc04))

### Features

- **sffv:** throw an error if it's called and the client doesn't have the functions ([#623](https://github.com/algolia/algoliasearch-helper-js/issues/623)) ([dd61360](https://github.com/algolia/algoliasearch-helper-js/commit/dd61360cabd24f1baf33e242f4337c0e2245e9fd))

## [2.26.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.26.0...2.26.1) (2018-06-19)

### Bug Fixes

- **\_dispatchAlgoliaResponse:** avoid mutate the client response ([#611](https://github.com/algolia/algoliasearch-helper-js/issues/611)) ([d6bd801](https://github.com/algolia/algoliasearch-helper-js/commit/d6bd801f3b3dc07ccd31b57947b8086c3fe07195))

# [2.26.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.25.1...2.26.0) (2018-04-25)

### Features

- Make `addAlgoliaAgent()` and `clearCache()` optional ([#577](https://github.com/algolia/algoliasearch-helper-js/issues/577)) ([220b013](https://github.com/algolia/algoliasearch-helper-js/commit/220b01323d75202d5531dd56d9b8211ff22b902c))

## [2.25.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.25.0...2.25.1) (2018-04-20)

### Bug Fixes

- **sffv:** unwrap content when it comes from multi queries ([#574](https://github.com/algolia/algoliasearch-helper-js/issues/574)) ([fcb15d4](https://github.com/algolia/algoliasearch-helper-js/commit/fcb15d488a27e57b621fa5b26531626353c8bf41))

# [2.25.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.24.0...2.25.0) (2018-04-18)

### Features

- **search:** Promisify `client.search()` ([#571](https://github.com/algolia/algoliasearch-helper-js/issues/571)) ([d12cbda](https://github.com/algolia/algoliasearch-helper-js/commit/d12cbda2bb8ebafdf3d5f9e442378d3efb7353ee))
- **sffv:** Use client SFFV over index SFFV ([#572](https://github.com/algolia/algoliasearch-helper-js/issues/572)) ([bb17720](https://github.com/algolia/algoliasearch-helper-js/commit/bb17720deed3d6325a28717a9452b278af456582))

# [2.24.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.23.2...2.24.0) (2018-01-31)

### Features

- make Helper ready for insights ([03f8f31](https://github.com/algolia/algoliasearch-helper-js/commit/03f8f31931efe1d9913c57066539b4422963f1bc))

## [2.23.2](https://github.com/algolia/algoliasearch-helper-js/compare/2.23.1...2.23.2) (2017-12-14)

### Bug Fixes

- **release-script:** actually build the library ([#559](https://github.com/algolia/algoliasearch-helper-js/issues/559)) ([421ec70](https://github.com/algolia/algoliasearch-helper-js/commit/421ec706606798035dda2e2226fd3eb9015ec901))

## [2.23.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.23.0...2.23.1) (2017-12-12)

### Bug Fixes

- **url:** treat insideBoundingBox in float form as number ([#554](https://github.com/algolia/algoliasearch-helper-js/issues/554)) ([3a7423e](https://github.com/algolia/algoliasearch-helper-js/commit/3a7423eb444a798c50528e2296931074c8fad1d3)), closes [#553](https://github.com/algolia/algoliasearch-helper-js/issues/553)

# [2.23.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.22.0...2.23.0) (2017-10-18)

### Bug Fixes

- **events:** only trigger change when there is an actual change ([#546](https://github.com/algolia/algoliasearch-helper-js/issues/546)) ([80f9724](https://github.com/algolia/algoliasearch-helper-js/commit/80f97242aaebaacbda0c5d750c62bf709fa0f502))

### Features

- **sffv:** can override search when using searchForFacetValues ([#549](https://github.com/algolia/algoliasearch-helper-js/issues/549)) ([55c2e75](https://github.com/algolia/algoliasearch-helper-js/commit/55c2e753be2236df91cd33a11a113e9dc4dd3038))

# [2.22.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.21.2...2.22.0) (2017-10-09)

### Bug Fixes

- **FacetValue doc:** wrong attribute name in docs ([#539](https://github.com/algolia/algoliasearch-helper-js/issues/539)) ([7275a75](https://github.com/algolia/algoliasearch-helper-js/commit/7275a756510f5d7df460ae99cb88af6c2e617424)), closes [/github.com/algolia/algoliasearch-helper-js/blob/master/src/SearchResults/index.js#L541-L548](https://github.com//github.com/algolia/algoliasearch-helper-js/blob/master/src/SearchResults/index.js/issues/L541-L548)
- **requestBuilder:** set analytics:false to subsequent queries ([#543](https://github.com/algolia/algoliasearch-helper-js/issues/543)) ([ebf41d9](https://github.com/algolia/algoliasearch-helper-js/commit/ebf41d97ea088af674e3661bfdd7f432018fc2c1)), closes [#540](https://github.com/algolia/algoliasearch-helper-js/issues/540)
- **setState:** use .make() instead of constructor() ([#542](https://github.com/algolia/algoliasearch-helper-js/issues/542)) ([173da7c](https://github.com/algolia/algoliasearch-helper-js/commit/173da7cb256d007b7328b6c90aa037b17dcf95be))

### Features

- **query rules:** expose userData ([#544](https://github.com/algolia/algoliasearch-helper-js/issues/544)) ([2f93520](https://github.com/algolia/algoliasearch-helper-js/commit/2f935204b5fd92098d17b8579863d6a761a573a3)), closes [#529](https://github.com/algolia/algoliasearch-helper-js/issues/529)

## [2.21.2](https://github.com/algolia/algoliasearch-helper-js/compare/2.21.1...2.21.2) (2017-07-27)

### Bug Fixes

- **SearchResults:** add exhaustiveNbHits and exhaustiveFacetsCount ([fad31fb](https://github.com/algolia/algoliasearch-helper-js/commit/fad31fbb2ba32f472ca28a8a88faff08a0900e80)), closes [#489](https://github.com/algolia/algoliasearch-helper-js/issues/489)

## [2.21.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.21.0...2.21.1) (2017-07-20)

### Bug Fixes

- **events:** We need searchEmptyQueue before result to avoid inconsistency ([4c58b0f](https://github.com/algolia/algoliasearch-helper-js/commit/4c58b0f597d5a1878723f79ce1cfe739c1358443))
- **pending-search:** dispatch error event before searchQueueEmpty ([#503](https://github.com/algolia/algoliasearch-helper-js/issues/503)) ([30e3f07](https://github.com/algolia/algoliasearch-helper-js/commit/30e3f07d0b695c434cc52a1351d57b1779fe1946))
- **url:** When there are no "other attributes" should not render last & ([#517](https://github.com/algolia/algoliasearch-helper-js/issues/517)) ([f376ff2](https://github.com/algolia/algoliasearch-helper-js/commit/f376ff237570b9a71cc9117d01220dba76324cba))

# [2.21.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.20.1...2.21.0) (2017-07-08)

### Bug Fixes

- **events:** events for all kinds of searches ([b960fee](https://github.com/algolia/algoliasearch-helper-js/commit/b960fee47db7cf2ae04277e86d0ad992010e61d1)), closes [#513](https://github.com/algolia/algoliasearch-helper-js/issues/513)

## [2.20.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.20.0...2.20.1) (2017-03-11)

### Bug Fixes

- **build:** Remove es2015 module ([#487](https://github.com/algolia/algoliasearch-helper-js/issues/487)) ([0896a65](https://github.com/algolia/algoliasearch-helper-js/commit/0896a65b132beec91bf433ee9fe7a4154e29b80f)), closes [#486](https://github.com/algolia/algoliasearch-helper-js/issues/486)

# [2.20.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.19.0...2.20.0) (2017-03-10)

### Features

- **maxFacetHits:** implement maxFacetHits for SFFV ([643c29a](https://github.com/algolia/algoliasearch-helper-js/commit/643c29a52a864d44e3fa3827f4eb1feceae634d7)), closes [#480](https://github.com/algolia/algoliasearch-helper-js/issues/480)
- **pending-search:** let the dev know the state of the search requests queue ([c5b39d2](https://github.com/algolia/algoliasearch-helper-js/commit/c5b39d203236b9cddc1fe4afd1f42e7d7762161d))

# [2.19.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.18.1...2.19.0) (2017-03-06)

### Features

- **search-response:** Exposed raw results ([8d4f938](https://github.com/algolia/algoliasearch-helper-js/commit/8d4f9387e0152b0a6ea637a4616bd3dbdd530fcf))

## [2.18.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.18.0...2.18.1) (2017-02-14)

### Bug Fixes

- **agent:** sets the helper agent once ([#474](https://github.com/algolia/algoliasearch-helper-js/issues/474)) ([c94cac5](https://github.com/algolia/algoliasearch-helper-js/commit/c94cac52e5179a4b7a00ca276a27165ccc836c5d)), closes [#473](https://github.com/algolia/algoliasearch-helper-js/issues/473)
- **toggleRefinement:** rename toggleRefinement to toggleFacetRefinement ([6700f98](https://github.com/algolia/algoliasearch-helper-js/commit/6700f98074662abb3bbae03b733c3029e542b59f)), closes [#447](https://github.com/algolia/algoliasearch-helper-js/issues/447)

# [2.18.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.17.1...2.18.0) (2017-01-10)

### Features

- **client:** Adds methods to set/get the client. ([#460](https://github.com/algolia/algoliasearch-helper-js/issues/460)) ([2ddd7ec](https://github.com/algolia/algoliasearch-helper-js/commit/2ddd7ec23507831153cd994a0e1917d3ac1a74be))

## [2.17.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.17.0...2.17.1) (2016-12-28)

### Bug Fixes

- **agent:** Add a test if addAlgoliaAgent exists ([#455](https://github.com/algolia/algoliasearch-helper-js/issues/455)) ([0ab4e31](https://github.com/algolia/algoliasearch-helper-js/commit/0ab4e3115eed5c10b4d4f1aea4d84bcacc9c6239))

# [2.17.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.16.0...2.17.0) (2016-12-22)

### Bug Fixes

- **doc:** fix deep object documentation. ([#450](https://github.com/algolia/algoliasearch-helper-js/issues/450)) ([6e3146e](https://github.com/algolia/algoliasearch-helper-js/commit/6e3146e1059837c29ad763cf4bc6c733a414d923)), closes [#443](https://github.com/algolia/algoliasearch-helper-js/issues/443)

# [2.16.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.15.0...2.16.0) (2016-12-06)

### Features

- **searchForFacetValues:** implement a new method to be able to search into facet values ([#423](https://github.com/algolia/algoliasearch-helper-js/issues/423)) ([8e2a5bb](https://github.com/algolia/algoliasearch-helper-js/commit/8e2a5bb3a9468d74d2cf5449895694bc2b184daf))

# [2.15.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.14.0...2.15.0) (2016-11-22)

# [2.14.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.13.0...2.14.0) (2016-09-09)

### Features

- **hierarchicalFacets:** add add and remove operations on hierarchical facets ([519d359](https://github.com/algolia/algoliasearch-helper-js/commit/519d3592e9bef913a066d221b2d53dbf4e763d37)), closes [#250](https://github.com/algolia/algoliasearch-helper-js/issues/250)

# [2.13.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.12.0...2.13.0) (2016-08-24)

### Bug Fixes

- **excludes:** conjunctive facets results report exclusions ([0f3f844](https://github.com/algolia/algoliasearch-helper-js/commit/0f3f844a9b3d50961b86a4a8353e859cd86a1ca1))

### Features

- **add-remove-facet:** add methods to add and remove facets from SearchParameters configuration ([#330](https://github.com/algolia/algoliasearch-helper-js/issues/330)) ([fd0e777](https://github.com/algolia/algoliasearch-helper-js/commit/fd0e77714452ef71732c1b68356eba2aeb700d8b))
- **add-remove-facet:** add methods to add and remove facets from SearchParameters configuration ([#333](https://github.com/algolia/algoliasearch-helper-js/issues/333)) ([f14dbbf](https://github.com/algolia/algoliasearch-helper-js/commit/f14dbbf40acc17d8efab6f0cfad1ddb83f9df641))
- **no-set-page:** don't reset the page to 0 in SearchParameters methods ([64a116e](https://github.com/algolia/algoliasearch-helper-js/commit/64a116ea30ff70aef85b0eae09a1aa78491157ea)), closes [#343](https://github.com/algolia/algoliasearch-helper-js/issues/343)
- **SearchResults:** backport instantsearch.js getRefinement method ([e3a3238](https://github.com/algolia/algoliasearch-helper-js/commit/e3a323840484d6a594edb7bc8eb8c01003d38b11)), closes [#195](https://github.com/algolia/algoliasearch-helper-js/issues/195)

### BREAKING CHANGES

- **no-set-page:** SearchParameters methods don't reset the page to 0 anymore.

# [2.12.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.11.1...2.12.0) (2016-07-22)

## [2.11.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.11.0...2.11.1) (2016-07-20)

# [2.11.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.10.0...2.11.0) (2016-06-22)

### Features

- **urls:** provide a `safe` option to fully encode the url ([3ef6ae1](https://github.com/algolia/algoliasearch-helper-js/commit/3ef6ae16f29f327af73d6d69b0917defcb267ab6))

# [2.10.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.9.1...2.10.0) (2016-06-10)

### Performance Improvements

- **deepFreeze:** Removing the calls to deepFreeze ([3a515b8](https://github.com/algolia/algoliasearch-helper-js/commit/3a515b8da400523e00ea926974672367798f65ae)), closes [#301](https://github.com/algolia/algoliasearch-helper-js/issues/301) [#301](https://github.com/algolia/algoliasearch-helper-js/issues/301)

## [2.9.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.9.0...2.9.1) (2016-03-16)

### Bug Fixes

- **filterState:** handle hierarchical facet attributes ([5bfdceb](https://github.com/algolia/algoliasearch-helper-js/commit/5bfdcebb43dc8fa867d00d4863cdd09eb2a06150))

# [2.9.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.8.1...2.9.0) (2016-02-19)

### Bug Fixes

- **numeric filters:** Makes it possible to add then remove a string based numeric filter ([8b2bb97](https://github.com/algolia/algoliasearch-helper-js/commit/8b2bb970bb655871c8d6060e2fbe2f47d9601d10))
- **numeric filters:** Makes it possible to add then remove a string based numeric filter ([d849f0b](https://github.com/algolia/algoliasearch-helper-js/commit/d849f0bdd020b7080620b53efb22ffbe84978b6a))
- **pagination:** adds doc on reset behavior, changes the name of setter ([ec70c8b](https://github.com/algolia/algoliasearch-helper-js/commit/ec70c8b10c91f68589ddc36be551a4c3525737c3))

### Features

- **url:** new mapping option for URL methods ([7d93cac](https://github.com/algolia/algoliasearch-helper-js/commit/7d93cac8aac6ae1ca2e50b73270ba139ec9b72fa))

## [2.8.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.8.0...2.8.1) (2016-02-01)

### Features

- add snippetEllipsisText, disableExactOnAttributes, enableExactOnSingleWordQuery ([c6af7af](https://github.com/algolia/algoliasearch-helper-js/commit/c6af7af0f93548d2c2cb9bb4a053e1867765f07b))

# [2.8.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.7.0...2.8.0) (2015-12-11)

### Bug Fixes

- **algoliasearch.helper:** fixes optionalTagFilters & optionalFacetFilters jsdoc ([e08ad78](https://github.com/algolia/algoliasearch-helper-js/commit/e08ad785724d4e11c91355e8b616aa971d4974a0))
- **hierarchicalFacets:** ensures the order of the hierarchical facets matches the order of the declared hierarchical attributes to avoid (silent) failures when the API returns JSON with unordered facets ([8a326cc](https://github.com/algolia/algoliasearch-helper-js/commit/8a326cc00e49d37467de5026830951823baa786c))
- **search-results:** adds missing results parameters ([1c4908a](https://github.com/algolia/algoliasearch-helper-js/commit/1c4908adec9c4b4b70a22e78638f881cbf60f354))

# [2.7.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.9...2.7.0) (2015-12-02)

### Bug Fixes

- **core:** makes node dependencies explicit ([d532bc9](https://github.com/algolia/algoliasearch-helper-js/commit/d532bc9d8fe928b8a5ee40fdd187560a5e7426d6))
- **request-builder:** Makes queries less ambiguous for client fix [#205](https://github.com/algolia/algoliasearch-helper-js/issues/205) ([9915c2f](https://github.com/algolia/algoliasearch-helper-js/commit/9915c2f1d0284cd8907ecc1217fcb8cfc04df3c2))

## [2.6.9](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.8...2.6.9) (2015-11-24)

### Bug Fixes

- **hierarchical:** exclude facet when the rootPath equal to the facet value ([42d386a](https://github.com/algolia/algoliasearch-helper-js/commit/42d386ae0dcc1b65a2317f32b6969a2dcf059e01))

## [2.6.8](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.7...2.6.8) (2015-11-24)

### Features

- **hierarchical:** add prefix path option to hierarchical facet ([10ee69e](https://github.com/algolia/algoliasearch-helper-js/commit/10ee69e2e50584a9cbdaa03aeea1db375dce5601))
- **hierarchical:** finish rootPath and add showParentLevel options to the hierararchical facets) ([f27af29](https://github.com/algolia/algoliasearch-helper-js/commit/f27af29b3d46358fd1e47dfc23e83d73863c8a1f))

## [2.6.7](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.6...2.6.7) (2015-11-17)

### Bug Fixes

- **hierarchicalWidget:** Error when faceted and no results ([6a6c554](https://github.com/algolia/algoliasearch-helper-js/commit/6a6c5547c65b71ef25186411c17e36b5c2f66914))

## [2.6.6](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.5...2.6.6) (2015-11-04)

### Bug Fixes

- removes window dependency ([b6c5043](https://github.com/algolia/algoliasearch-helper-js/commit/b6c50433841355ecd93959ec665bdd0717347b79))
- **SearchParameters:** parses all numeric attributes ([4a8e770](https://github.com/algolia/algoliasearch-helper-js/commit/4a8e77012ffea6e7b6be93b246df698fea7997dc))

## [2.6.5](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.4...2.6.5) (2015-11-03)

### Bug Fixes

- **hierarchical:** refined + no result ([d0337d3](https://github.com/algolia/algoliasearch-helper-js/commit/d0337d3fb2916550f157696909532a973f1cced2))

## [2.6.4](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.3...2.6.4) (2015-11-02)

### Bug Fixes

- **hierarchical:** reset pagination to 0 when refining ([e1193ef](https://github.com/algolia/algoliasearch-helper-js/commit/e1193ef5d79cfffd3962a5d5285410013c79c62f))

## [2.6.3](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.2...2.6.3) (2015-10-19)

## [2.6.2](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.1...2.6.2) (2015-10-16)

## [2.6.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.6.0...2.6.1) (2015-10-15)

### Features

- **SearchParameters:** toggleRefinement on SearchParameters ([ac71495](https://github.com/algolia/algoliasearch-helper-js/commit/ac714957bb04b42f03ce91b82b0c7d8765165ba9))

# [2.6.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.5.1...2.6.0) (2015-10-15)

## [2.5.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.5.0...2.5.1) (2015-10-12)

### Bug Fixes

- **facetStats:** a facet can be both in facets & disjunctiveFacets ([458a694](https://github.com/algolia/algoliasearch-helper-js/commit/458a694101ae61abdea88d257fd956e4f563f2da)), closes [#228](https://github.com/algolia/algoliasearch-helper-js/issues/228)

# [2.5.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.4.0...2.5.0) (2015-10-09)

# [2.4.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.3.6...2.4.0) (2015-09-23)

### Bug Fixes

- avoid using console.error in IE8/9 when not available ([c4c6127](https://github.com/algolia/algoliasearch-helper-js/commit/c4c6127b23b6d8a23a2b447bc82fd9136be6d9fc))

## [2.3.6](https://github.com/algolia/algoliasearch-helper-js/compare/2.3.5...2.3.6) (2015-09-17)

### Bug Fixes

- IE8 has no Array.indexOf ([4724048](https://github.com/algolia/algoliasearch-helper-js/commit/47240481b9c0e7341bd51a3021f092124837c8e1))

## [2.3.5](https://github.com/algolia/algoliasearch-helper-js/compare/2.3.4...2.3.5) (2015-09-11)

### Bug Fixes

- getFacetStats should look in both facets, disjunctiveFacets ([95aa9b8](https://github.com/algolia/algoliasearch-helper-js/commit/95aa9b821ff45c09588b6b15280d5e459b56c418))

## [2.3.4](https://github.com/algolia/algoliasearch-helper-js/compare/2.3.3...2.3.4) (2015-09-11)

## [2.3.3](https://github.com/algolia/algoliasearch-helper-js/compare/2.3.2...2.3.3) (2015-09-09)

### Bug Fixes

- defaultNumericRefinement is an object not an array ([cf17d55](https://github.com/algolia/algoliasearch-helper-js/commit/cf17d5506f2e05c9bc79f1d95fb911ebf5d7c6fe))
- hasRefinements should look for every type of refinement ([acb2719](https://github.com/algolia/algoliasearch-helper-js/commit/acb2719396bd2fef56eadb415319f19a10d56b6d)), closes [#204](https://github.com/algolia/algoliasearch-helper-js/issues/204)

## [2.3.2](https://github.com/algolia/algoliasearch-helper-js/compare/2.3.1...2.3.2) (2015-09-04)

### Bug Fixes

- accepts `length` parameter by fixing searchParameters iteration ([a6a9e53](https://github.com/algolia/algoliasearch-helper-js/commit/a6a9e53c16a0b5cc2ee0ba3311629fe2e5b233dc))

## [2.3.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.3.0...2.3.1) (2015-09-02)

### Bug Fixes

- add undocumented offset and length params ([87fdb81](https://github.com/algolia/algoliasearch-helper-js/commit/87fdb81ae1c2fae1d7b74062081216dc5940097d))
- throw when unknown parameter ([8c97080](https://github.com/algolia/algoliasearch-helper-js/commit/8c97080e320a37dee2be06585118d607f1f3f89c))

# [2.3.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.2.0...2.3.0) (2015-09-02)

### Bug Fixes

- typo ([4979da2](https://github.com/algolia/algoliasearch-helper-js/commit/4979da20e2b2dce4c041320250676988b15325be))

# [2.2.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.1.2...2.2.0) (2015-07-29)

### Bug Fixes

- bad results computation when alwaysGetRootLevel ([44e18d4](https://github.com/algolia/algoliasearch-helper-js/commit/44e18d41e3353f9048052461bf21d8db9b1faf1b))
- change the default hierarchical facet behavior ([01cb48d](https://github.com/algolia/algoliasearch-helper-js/commit/01cb48da841f2a4e740fe5cc5f870bbc4f48b00b))
- clear hierarchical refinements appropriately ([992d677](https://github.com/algolia/algoliasearch-helper-js/commit/992d6770b0e95f43fa1d906ce8880ac436762933))
- edge case on toggleRefine hierarchical facet ([95ab755](https://github.com/algolia/algoliasearch-helper-js/commit/95ab755c722ff93406517b5ab4ef103ef289c371))
- eslint fixes in hierarchical faceting ([14db531](https://github.com/algolia/algoliasearch-helper-js/commit/14db53153b646c7348f8ade46be3759581d2171c))
- getFacetByName for hierarchical facets ([81829fc](https://github.com/algolia/algoliasearch-helper-js/commit/81829fcf4006dd4129d920068349350fc4b4eb4b))
- handle multiple hierarchical facets ([b41b6a5](https://github.com/algolia/algoliasearch-helper-js/commit/b41b6a5acfae82bf19477f1543981150be410d4d))
- handle objects with multiple categories values ([b81c17b](https://github.com/algolia/algoliasearch-helper-js/commit/b81c17b7dcce7ef9acdfa56071057a4b622edc91)), closes [#163](https://github.com/algolia/algoliasearch-helper-js/issues/163)
- handle toggleRefine on a different parent leaf than the current one ([6734971](https://github.com/algolia/algoliasearch-helper-js/commit/6734971b19e657314e68dccd40b5bdc8fd70296b))
- hierarchical alwaysGetRootLevel count was bad ([cf595ea](https://github.com/algolia/algoliasearch-helper-js/commit/cf595ea76e1d59c84d770cd49f3e6a881196cf5d))
- hierarchicalFacets toggleRefine on parent should not refine parent ([4639cbf](https://github.com/algolia/algoliasearch-helper-js/commit/4639cbff676fad08ef0d718562e416385cbcff88)), closes [#164](https://github.com/algolia/algoliasearch-helper-js/issues/164)
- hierarchicalFacetsRefinements is now an array ([762b588](https://github.com/algolia/algoliasearch-helper-js/commit/762b58817a90c2c7deb8499e6777402c501d14c6)), closes [#160](https://github.com/algolia/algoliasearch-helper-js/issues/160)
- isDisjunctiveRefined() and isRefined() return true/false ([1bb31a3](https://github.com/algolia/algoliasearch-helper-js/commit/1bb31a371aed2350afd7163e3aefb3c8b21471ca)), closes [#123](https://github.com/algolia/algoliasearch-helper-js/issues/123)
- isDisjunctiveRefined() and isRefined() return true/false ([2d9edd9](https://github.com/algolia/algoliasearch-helper-js/commit/2d9edd982a38a02186cb6fe813e7346e96c1056c)), closes [#123](https://github.com/algolia/algoliasearch-helper-js/issues/123)
- params are optional right? ([5f43031](https://github.com/algolia/algoliasearch-helper-js/commit/5f430310d41a8969cbba743f9c7818214623e605))
- stop triming facet filters values automatically ([8c67bb5](https://github.com/algolia/algoliasearch-helper-js/commit/8c67bb58271b0549c13e752575d88f453a15ddb0))
- throw on unknown hierarchical facet ([5df3397](https://github.com/algolia/algoliasearch-helper-js/commit/5df339798029885c6253ce760bf35312b204f9ad))
- toggleRefine on root level of a hierarchical refinement ([47ecdfe](https://github.com/algolia/algoliasearch-helper-js/commit/47ecdfebc15fee41b7f1bb565ccfc4525cefeed8))
- use setQueryParameters() instead of mutateMe ([4fc3df9](https://github.com/algolia/algoliasearch-helper-js/commit/4fc3df9797fa836c303ad6826c8f7d0999a47b24))
- wrong facetFilters on disjunctive + hierarchical facet ([88df8c5](https://github.com/algolia/algoliasearch-helper-js/commit/88df8c5c7f6028e0e2e6d4194138713c46e5f5b3)), closes [#161](https://github.com/algolia/algoliasearch-helper-js/issues/161)

### Features

- add alwaysGetRootLevel option ([dd97d98](https://github.com/algolia/algoliasearch-helper-js/commit/dd97d98e5e8613ec9de29ba7be6c39a4acf275b8))
- add hierarchical facet sortBy option ([04254c7](https://github.com/algolia/algoliasearch-helper-js/commit/04254c7af88ddce4e831ea71194835363081700e))
- hierarchical facets ([695cf00](https://github.com/algolia/algoliasearch-helper-js/commit/695cf007a265a5c1529faadb029ec4220ed48c44))
- IE8 compatibility ([e9898f9](https://github.com/algolia/algoliasearch-helper-js/commit/e9898f97d2ab06e7fc7c6e19c4e7a4825be03d13))

### Reverts

- Revert "test: remove travis cache, may be buggy" ([415dab6](https://github.com/algolia/algoliasearch-helper-js/commit/415dab6afa6217a36b78f79f67dba499ff6f32df))

## [2.1.2](https://github.com/algolia/algoliasearch-helper-js/compare/2.1.1...2.1.2) (2015-06-29)

## [2.1.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.1.0...2.1.1) (2015-06-19)

### Bug Fixes

- **eslint:** Set eslintrc as a valid JSON. ([7bab8aa](https://github.com/algolia/algoliasearch-helper-js/commit/7bab8aac9f6bd2bc535d1eba6fb3cd5ba9070739))

# [2.1.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.0.4...2.1.0) (2015-06-15)

## [2.0.4](https://github.com/algolia/algoliasearch-helper-js/compare/2.0.3...2.0.4) (2015-05-19)

## [2.0.3](https://github.com/algolia/algoliasearch-helper-js/compare/2.0.2...2.0.3) (2015-05-13)

## [2.0.2](https://github.com/algolia/algoliasearch-helper-js/compare/2.0.1...2.0.2) (2015-05-06)

## [2.0.1](https://github.com/algolia/algoliasearch-helper-js/compare/2.0.0...2.0.1) (2015-04-28)

# [2.0.0](https://github.com/algolia/algoliasearch-helper-js/compare/2.0.0-rc5...2.0.0) (2015-04-28)

# [2.0.0-rc5](https://github.com/algolia/algoliasearch-helper-js/compare/2.0.0-beta...2.0.0-rc5) (2015-04-21)

# [2.0.0-beta](https://github.com/algolia/algoliasearch-helper-js/compare/1.0.0...2.0.0-beta) (2015-04-16)

# 1.0.0 (2015-03-24)
