<a name="2.6.1"></a>
## [2.6.1](https://github.com/algolia/instantsearch.js/compare/v2.6.0...v2.6.1) (2018-03-28)


### Bug Fixes

* **connectBreadcrumb:** allow unmounting ([#2815](https://github.com/algolia/instantsearch.js/issues/2815)) ([c6c353a](https://github.com/algolia/instantsearch.js/commit/c6c353a))
* **connectBreadcrumb:** update typo in property type items ([#2782](https://github.com/algolia/instantsearch.js/issues/2782)) ([79ebd66](https://github.com/algolia/instantsearch.js/commit/79ebd66))
* **docgen:** pass the relatedTypes to the struct mixin in connectors layout ([#2780](https://github.com/algolia/instantsearch.js/issues/2780)) ([f7f8b05](https://github.com/algolia/instantsearch.js/commit/f7f8b05))
* **GeoSearch:** update typo in property type cssClasses ([#2781](https://github.com/algolia/instantsearch.js/issues/2781)) ([419c2ab](https://github.com/algolia/instantsearch.js/commit/419c2ab))
* **main:** correctly import EventEmitter ([#2814](https://github.com/algolia/instantsearch.js/issues/2814)) ([8fa3649](https://github.com/algolia/instantsearch.js/commit/8fa3649)), closes [#2730](https://github.com/algolia/instantsearch.js/issues/2730)



<a name="2.6.0"></a>
# [2.6.0](https://github.com/algolia/instantsearch.js/compare/v2.5.2...v2.6.0) (2018-03-06)


### Bug Fixes

* **GeoSearch:** add apiKey for Google Maps ([#2773](https://github.com/algolia/instantsearch.js/issues/2773)) ([6c1846f](https://github.com/algolia/instantsearch.js/commit/6c1846f))
* **GeoSearch:** override button style ([#2772](https://github.com/algolia/instantsearch.js/issues/2772)) ([4d69b50](https://github.com/algolia/instantsearch.js/commit/4d69b50))


### Features

* **configure:** add the Configure widget ([#2698](https://github.com/algolia/instantsearch.js/issues/2698)) ([94daabc](https://github.com/algolia/instantsearch.js/commit/94daabc))
* add GeoSearch widget & connector ([#2743](https://github.com/algolia/instantsearch.js/issues/2743)) ([7fa17ff](https://github.com/algolia/instantsearch.js/commit/7fa17ff))



<a name="2.5.2"></a>
## [2.5.2](https://github.com/algolia/instantsearch.js/compare/v2.5.1...v2.5.2) (2018-02-26)


### Bug Fixes

* **Template:** harden Symbol checks ([#2749](https://github.com/algolia/instantsearch.js/issues/2749)) ([fab66bc](https://github.com/algolia/instantsearch.js/commit/fab66bc))
* **yarnrc:** use empty string for save-prefix ([#2739](https://github.com/algolia/instantsearch.js/issues/2739)) ([979e0cd](https://github.com/algolia/instantsearch.js/commit/979e0cd))



<a name="2.5.1"></a>
## [2.5.1](https://github.com/algolia/instantsearch.js/compare/v2.5.0...v2.5.1) (2018-02-13)


### Bug Fixes

* **perf:** only compute snappoints when step is provided ([#2699](https://github.com/algolia/instantsearch.js/issues/2699)) ([ce9ca19](https://github.com/algolia/instantsearch.js/commit/ce9ca19)), closes [#2662](https://github.com/algolia/instantsearch.js/issues/2662)



<a name="2.5.0"></a>
# [2.5.0](https://github.com/algolia/instantsearch.js/compare/v2.4.1...v2.5.0) (2018-02-06)


### Bug Fixes

* **doc:** add maximum width to images (fix [#2685](https://github.com/algolia/instantsearch.js/issues/2685)) ([#2686](https://github.com/algolia/instantsearch.js/issues/2686)) ([f4b5377](https://github.com/algolia/instantsearch.js/commit/f4b5377))


### Features

* support for algolia insights ([#2689](https://github.com/algolia/instantsearch.js/issues/2689)) ([96b8d61](https://github.com/algolia/instantsearch.js/commit/96b8d61))



<a name="2.4.1"></a>
## [2.4.1](https://github.com/algolia/instantsearch.js/compare/v2.4.0...v2.4.1) (2018-01-04)


### Bug Fixes

* **core:** correct escape highlight for arrays and nested objects ([#2646](https://github.com/algolia/instantsearch.js/issues/2646)) ([ed0ee73](https://github.com/algolia/instantsearch.js/commit/ed0ee73))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/algolia/instantsearch.js/compare/v2.3.3...v2.4.0) (2018-01-02)


### Bug Fixes

* **pagination:** disable buttons if not results ([#2643](https://github.com/algolia/instantsearch.js/issues/2643)) ([9017b72](https://github.com/algolia/instantsearch.js/commit/9017b72)), closes [#2014](https://github.com/algolia/instantsearch.js/issues/2014)
* **theme:** fix height of pagination ([#2641](https://github.com/algolia/instantsearch.js/issues/2641)) ([b3185e5](https://github.com/algolia/instantsearch.js/commit/b3185e5))


### Features

* **core:** add a reload method on the InstantSearch component ([#2637](https://github.com/algolia/instantsearch.js/issues/2637)) ([e73ff13](https://github.com/algolia/instantsearch.js/commit/e73ff13))
* **core:** add an error event to monitor error from Algolia ([#2642](https://github.com/algolia/instantsearch.js/issues/2642)) ([71c2d68](https://github.com/algolia/instantsearch.js/commit/71c2d68)), closes [#1585](https://github.com/algolia/instantsearch.js/issues/1585)
* **core:** rename `reload` to `refresh` ([#2645](https://github.com/algolia/instantsearch.js/issues/2645)) ([9b8ac65](https://github.com/algolia/instantsearch.js/commit/9b8ac65))
* **wrapWithHits:** enable async init ([#2635](https://github.com/algolia/instantsearch.js/issues/2635)) ([08a8747](https://github.com/algolia/instantsearch.js/commit/08a8747))



<a name="2.3.3"></a>
## [2.3.3](https://github.com/algolia/instantsearch.js/compare/v2.3.2...v2.3.3) (2017-12-11)


### Bug Fixes

* **core:** search is stalled at init ([#2623](https://github.com/algolia/instantsearch.js/issues/2623)) ([e3dd577](https://github.com/algolia/instantsearch.js/commit/e3dd577)), closes [#2616](https://github.com/algolia/instantsearch.js/issues/2616)



<a name="2.3.2"></a>
## [2.3.2](https://github.com/algolia/instantsearch.js/compare/v2.3.1...v2.3.2) (2017-12-06)


### Bug Fixes

* React reference: Breadcrumb & RangeInput components ([#2618](https://github.com/algolia/instantsearch.js/issues/2618)) ([7f32161](https://github.com/algolia/instantsearch.js/commit/7f32161))



<a name="2.3.1"></a>
## [2.3.1](https://github.com/algolia/instantsearch.js/compare/v2.3.0...v2.3.1) (2017-12-04)


### Bug Fixes

* **connectors:** check facet is refined before removing it. hierarchicalMenu / menu ([67ae035](https://github.com/algolia/instantsearch.js/commit/67ae035))
* **poweredBy:** minify slightly and make into correct URL ([#2615](https://github.com/algolia/instantsearch.js/issues/2615)) ([2b7d747](https://github.com/algolia/instantsearch.js/commit/2b7d747)), closes [#2613](https://github.com/algolia/instantsearch.js/issues/2613)



<a name="2.3.0"></a>
# [2.3.0](https://github.com/algolia/instantsearch.js/compare/v2.3.0-beta.7...v2.3.0) (2017-11-30)


### Bug Fixes

* **InstantSearch.dispose:** dont call `getConfiguration` of URLSync widget ([#2604](https://github.com/algolia/instantsearch.js/issues/2604)) ([3234b12](https://github.com/algolia/instantsearch.js/commit/3234b12))
* **connectors:** prefer wrappers over bind ([#2575](https://github.com/algolia/instantsearch.js/issues/2575)) ([f8e0e00](https://github.com/algolia/instantsearch.js/commit/f8e0e00))
* **connectHierarchicalMenu:** do not return if facet not set ([#2521](https://github.com/algolia/instantsearch.js/issues/2521)) ([26e99fb](https://github.com/algolia/instantsearch.js/commit/26e99fb))



### Features

* **core:** provide information about stalled search to widgets ([#2569](https://github.com/algolia/instantsearch.js/issues/2569)) ([d104be1](https://github.com/algolia/instantsearch.js/commit/d104be1))
* **core:** InstantSearch hot remove/add widgets ([#2384](https://github.com/algolia/instantsearch.js/issues/2384)) ([cfc1710](https://github.com/algolia/instantsearch.js/commit/cfc1710))
* **refinementList:** add escapeFacetHits parameter ([#2507](https://github.com/algolia/instantsearch.js/issues/2507)) ([9b1b7ee](https://github.com/algolia/instantsearch.js/commit/9b1b7ee))
* **breadcrumb:** Add the breadcrumb widget ([#2451](https://github.com/algolia/instantsearch.js/issues/2451)) ([11d78f0](https://github.com/algolia/instantsearch.js/commit/11d78f0)), closes [#2299](https://github.com/algolia/instantsearch.js/issues/2299)
* **connectRange:** round the range based on precision ([#2498](https://github.com/algolia/instantsearch.js/issues/2498)) ([d4df45d](https://github.com/algolia/instantsearch.js/commit/d4df45d))
* **rangeInput:** add rangeInput widget ([#2440](https://github.com/algolia/instantsearch.js/issues/2440)) ([7916d16](https://github.com/algolia/instantsearch.js/commit/7916d16))



<a name="2.2.5"></a>
## [2.2.5](https://github.com/algolia/instantsearch.js/compare/v2.2.4...v2.2.5) (2017-11-20)


### Bug Fixes

* **searchbox:** fix usage of custom reset template ([#2585](https://github.com/algolia/instantsearch.js/issues/2585)) ([aad92b9](https://github.com/algolia/instantsearch.js/commit/aad92b9)), closes [#2528](https://github.com/algolia/instantsearch.js/issues/2528)



<a name="2.2.4"></a>
## [2.2.4](https://github.com/algolia/instantsearch.js/compare/v2.2.3...v2.2.4) (2017-11-13)


### Bug Fixes

* **numericSelector:** make default value possible ([#2565](https://github.com/algolia/instantsearch.js/issues/2565)) ([5664f98](https://github.com/algolia/instantsearch.js/commit/5664f98))



<a name="2.2.3"></a>
## [2.2.3](https://github.com/algolia/instantsearch.js/compare/v2.2.2...v2.2.3) (2017-11-07)


### Bug Fixes

* **connectRefinementList:** add label to searched items ([#2553](https://github.com/algolia/instantsearch.js/issues/2553)) ([ec810fa](https://github.com/algolia/instantsearch.js/commit/ec810fa))
* **refinementList:** fix facet exhaustivity check ([#2554](https://github.com/algolia/instantsearch.js/issues/2554)) ([0f1bf08](https://github.com/algolia/instantsearch.js/commit/0f1bf08)), closes [#2552](https://github.com/algolia/instantsearch.js/issues/2552)
* **theme:** searchbar should have normal size input ([#2545](https://github.com/algolia/instantsearch.js/issues/2545)) ([50d99f0](https://github.com/algolia/instantsearch.js/commit/50d99f0))



<a name="2.2.2"></a>
## [2.2.2](https://github.com/algolia/instantsearch.js/compare/v2.2.1...v2.2.2) (2017-10-30)


### Bug Fixes

* **connectRefinementList:** set default value for limit ([#2517](https://github.com/algolia/instantsearch.js/issues/2517)) ([32918c9](https://github.com/algolia/instantsearch.js/commit/32918c9))
* **MenuSelect:** switch from react to preact-compat ([#2513](https://github.com/algolia/instantsearch.js/issues/2513)) ([06aa626](https://github.com/algolia/instantsearch.js/commit/06aa626))
* **range-slider:** add option `collapsible` ([#2502](https://github.com/algolia/instantsearch.js/issues/2502)) ([e78399d](https://github.com/algolia/instantsearch.js/commit/e78399d)), closes [#2501](https://github.com/algolia/instantsearch.js/issues/2501)
* **url-sync:** make URLSync consistent even if search is tampered ([392927e](https://github.com/algolia/instantsearch.js/commit/392927e)), closes [#2523](https://github.com/algolia/instantsearch.js/issues/2523)



<a name="2.2.1"></a>
## [2.2.1](https://github.com/algolia/instantsearch.js/compare/v2.2.0...v2.2.1) (2017-10-16)


### Bug Fixes

* **connectRangeSlider:** only clear the refinement on the current attribute ([#2459](https://github.com/algolia/instantsearch.js/issues/2459)) ([7cebf58](https://github.com/algolia/instantsearch.js/commit/7cebf58))
* **menuSelect:** select in userCssClasses ([#2455](https://github.com/algolia/instantsearch.js/issues/2455)) ([0eb3dc8](https://github.com/algolia/instantsearch.js/commit/0eb3dc8))
* **menuSelect:** use preact instead of React ([#2460](https://github.com/algolia/instantsearch.js/issues/2460)) ([35ccae8](https://github.com/algolia/instantsearch.js/commit/35ccae8))
* **test:** correctly reset the wired dependency ([#2461](https://github.com/algolia/instantsearch.js/issues/2461)) ([1f7f4ed](https://github.com/algolia/instantsearch.js/commit/1f7f4ed))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/algolia/instantsearch.js/compare/v2.1.6...v2.2.0) (2017-10-03)


### Bug Fixes

* **build:** minify css with `csso` instead of unminify css ([#2419](https://github.com/algolia/instantsearch.js/issues/2419)) ([12f96b8](https://github.com/algolia/instantsearch.js/commit/12f96b8)), closes [#2375](https://github.com/algolia/instantsearch.js/issues/2375)
* **clear-all:** display the query when clearsQuery is true ([#2414](https://github.com/algolia/instantsearch.js/issues/2414)) ([6921895](https://github.com/algolia/instantsearch.js/commit/6921895))
* **range-slider:** Fix slider boundaries ([#2408](https://github.com/algolia/instantsearch.js/issues/2408)) ([bea43db](https://github.com/algolia/instantsearch.js/commit/bea43db)), closes [#2386](https://github.com/algolia/instantsearch.js/issues/2386)
* **selector:** root classname is applied twice ([#2423](https://github.com/algolia/instantsearch.js/issues/2423)) ([44dca11](https://github.com/algolia/instantsearch.js/commit/44dca11)), closes [#2396](https://github.com/algolia/instantsearch.js/issues/2396) [#2397](https://github.com/algolia/instantsearch.js/issues/2397)
* **webpack.dev:** sourcemaps in dev ([#2422](https://github.com/algolia/instantsearch.js/issues/2422)) ([ba6ca0a](https://github.com/algolia/instantsearch.js/commit/ba6ca0a))


### Features

* **menu-select:** add menu select widget ([#2316](https://github.com/algolia/instantsearch.js/issues/2316)) ([680f9bd](https://github.com/algolia/instantsearch.js/commit/680f9bd))



<a name="2.2.0-beta.1"></a>
# [2.2.0-beta.1](https://github.com/algolia/instantsearch.js/compare/v2.1.4...v2.2.0-beta.1) (2017-09-18)


### Features

* **analytics:** Push pagination ([#2337](https://github.com/algolia/instantsearch.js/issues/2337)) ([94ce086](https://github.com/algolia/instantsearch.js/commit/94ce086))
* **hitsPerPageSelector:** default hits per page setting ([4efd43e](https://github.com/algolia/instantsearch.js/commit/4efd43e))
* **hitsPerPageSelector:** default hits per page setting ([355f080](https://github.com/algolia/instantsearch.js/commit/355f080))



<a name="2.1.6"></a>
## [2.1.6](https://github.com/algolia/instantsearch.js/compare/v2.1.5...v2.1.6) (2017-09-26)


### Bug Fixes

* **deps:** update dependency documentation to v^5.0.0 ([#2355](https://github.com/algolia/instantsearch.js/issues/2355)) ([489647a](https://github.com/algolia/instantsearch.js/commit/489647a))
* **searchbox:** use initial input value if provided in the dom ([#2342](https://github.com/algolia/instantsearch.js/issues/2342)) ([180902a](https://github.com/algolia/instantsearch.js/commit/180902a)), closes [#2289](https://github.com/algolia/instantsearch.js/issues/2289)



<a name="2.1.5"></a>
## [2.1.5](https://github.com/algolia/instantsearch.js/compare/v2.1.4...v2.1.5) (2017-09-25)


### Bug Fixes

* **deps:** update dependency algolia-frontend-components to v^0.0.33 ([#2341](https://github.com/algolia/instantsearch.js/issues/2341)) ([16994d8](https://github.com/algolia/instantsearch.js/commit/16994d8))
* **price-ranges:** update call to refine ([#2377](https://github.com/algolia/instantsearch.js/issues/2377)) ([34915d7](https://github.com/algolia/instantsearch.js/commit/34915d7))
* **slider:** Fix range slider pips and value 0 ([#2350](https://github.com/algolia/instantsearch.js/issues/2350)) ([fa0dc09](https://github.com/algolia/instantsearch.js/commit/fa0dc09)), closes [#2343](https://github.com/algolia/instantsearch.js/issues/2343)



<a name="2.1.4"></a>
## [2.1.4](https://github.com/algolia/instantsearch.js/compare/v2.1.3...v2.1.4) (2017-09-14)


### Bug Fixes

* **release-script:** Add the generation of changelog for the release ([#2333](https://github.com/algolia/instantsearch.js/issues/2333)) ([9a2f70b](https://github.com/algolia/instantsearch.js/commit/9a2f70b))
* **slider:** edge case when min > max ([#2336](https://github.com/algolia/instantsearch.js/issues/2336)) ([8830ab0](https://github.com/algolia/instantsearch.js/commit/8830ab0))
* **slider:** Fix range slider dev env ([#2320](https://github.com/algolia/instantsearch.js/issues/2320)) ([e78de70](https://github.com/algolia/instantsearch.js/commit/e78de70))
* **slider:** use algolia fork of rheostat ([#2335](https://github.com/algolia/instantsearch.js/issues/2335)) ([9eae009](https://github.com/algolia/instantsearch.js/commit/9eae009))



<a name="2.1.3"></a>
## [2.1.3](https://github.com/algolia/instantsearch.js/compare/v2.1.2...v2.1.3) (2017-09-05)


### Bug Fixes

* **Pagination:** add `autohideContainerHOC` to <Pagination /> ([#2296](https://github.com/algolia/instantsearch.js/issues/2296)) ([545f076](https://github.com/algolia/instantsearch.js/commit/545f076))
* **sffv:** no error when not providing noResults and no results ([#2310](https://github.com/algolia/instantsearch.js/issues/2310)) ([cc02b71](https://github.com/algolia/instantsearch.js/commit/cc02b71)), closes [#2087](https://github.com/algolia/instantsearch.js/issues/2087)



<a name="2.1.2"></a>
## [2.1.2](https://github.com/algolia/instantsearch.js/compare/v2.1.1...v2.1.2) (2017-08-24)


### Bug Fixes

* **es:** wrong path to files ([#2295](https://github.com/algolia/instantsearch.js/issues/2295)) ([a437e19](https://github.com/algolia/instantsearch.js/commit/a437e19))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/algolia/instantsearch.js/compare/v2.1.0...v2.1.1) (2017-08-23)


### Bug Fixes

* **build:** provide unminified css as well ([#2292](https://github.com/algolia/instantsearch.js/issues/2292)) ([a79e067](https://github.com/algolia/instantsearch.js/commit/a79e067))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/algolia/instantsearch.js/compare/v2.1.0-beta.4...v2.1.0) (2017-08-21)


### Bug Fixes

* **nvmrc:** upgrade nodejs version ([#2291](https://github.com/algolia/instantsearch.js/issues/2291)) ([94529d4](https://github.com/algolia/instantsearch.js/commit/94529d4))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/algolia/instantsearch.js/compare/v2.0.1...v2.0.2) (2017-07-24)


### Bug Fixes

* **doc:** Cosmetic change ([48bb128](https://github.com/algolia/instantsearch.js/commit/48bb128))
* **search-box:** fix magnifier and reset customization ([4adfade](https://github.com/algolia/instantsearch.js/commit/4adfade))
* **theme:** enforce box-sizing: border-box ([e26e50d](https://github.com/algolia/instantsearch.js/commit/e26e50d))
* **url-sync:** remove is_v from url ([f19a1d5](https://github.com/algolia/instantsearch.js/commit/f19a1d5)), closes [#2233](https://github.com/algolia/instantsearch.js/issues/2233)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/algolia/instantsearch.js/compare/v2.0.0...v2.0.1) (2017-07-12)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/algolia/instantsearch.js/compare/v1.11.15...v2.0.0) (2017-07-01)


### Bug Fixes

* **argos-ci:** blur the active element ([66d0551](https://github.com/algolia/instantsearch.js/commit/66d0551))
* **connectNumericRefinementList:** reset page on refine ([22ec08d](https://github.com/algolia/instantsearch.js/commit/22ec08d))
* **doc.build:** watch & rebuild `.pug` ([16d8542](https://github.com/algolia/instantsearch.js/commit/16d8542))
* **doc.build/autoprefixer:** update mtime for onlyChanged plugin ([3b83e58](https://github.com/algolia/instantsearch.js/commit/3b83e58))
* **escapeHits:** dont apply configuration if not requested ([c89f99d](https://github.com/algolia/instantsearch.js/commit/c89f99d))


### Features

* **searchFunction:** make search function provide a better API ([8fc0831](https://github.com/algolia/instantsearch.js/commit/8fc0831))



<a name="2.0.0-beta.5"></a>
# [2.0.0-beta.5](https://github.com/algolia/instantsearch.js/compare/v1.11.12...v2.0.0-beta.5) (2017-06-01)


### Bug Fixes

* **Slider:** dont call `refine()` when it's disabled ([f1eabc9](https://github.com/algolia/instantsearch.js/commit/f1eabc9))


### Features

* **hits:** opt-in xss filtering for hits and infinite hits. FIX #2138 ([4f67b48](https://github.com/algolia/instantsearch.js/commit/4f67b48)), closes [#2138](https://github.com/algolia/instantsearch.js/issues/2138)



<a name="2.0.0-beta.4"></a>
# [2.0.0-beta.4](https://github.com/algolia/instantsearch.js/compare/v1.11.11...v2.0.0-beta.4) (2017-05-24)


### Bug Fixes

* **misc:** IE 11 support ([072edfe](https://github.com/algolia/instantsearch.js/commit/072edfe))
* **misc:** IE11 support without using transpiler ([324f062](https://github.com/algolia/instantsearch.js/commit/324f062))
* **show-more:** should hide button when show more is not available (#2161) ([fbca3e6](https://github.com/algolia/instantsearch.js/commit/fbca3e6)), closes [#2160](https://github.com/algolia/instantsearch.js/issues/2160)
* **Slider:** handle edge case where `min === max` ([22a5614](https://github.com/algolia/instantsearch.js/commit/22a5614))
* **Slider:** restore `slider--handle-lower` && `slider--handle-upper` ([64d7ad2](https://github.com/algolia/instantsearch.js/commit/64d7ad2))



<a name="2.0.0-beta.2"></a>
# [2.0.0-beta.2](https://github.com/algolia/instantsearch.js/compare/v1.11.9...v2.0.0-beta.2) (2017-05-17)


### Bug Fixes

* **autoHideContainer:** dont prevent render with `shouldComponentUpdate` ([8c4b13f](https://github.com/algolia/instantsearch.js/commit/8c4b13f))
* **clearsQuery:** not applied when only the query was not empty ([e7976ad](https://github.com/algolia/instantsearch.js/commit/e7976ad))
* **connectors:** ensure `widgetParams` is at least an `{}` ([0c0e98f](https://github.com/algolia/instantsearch.js/commit/0c0e98f))
* **connectRefinementList:** currentRefinements: return an array instead of first item ([a53223a](https://github.com/algolia/instantsearch.js/commit/a53223a)), closes [#2102](https://github.com/algolia/instantsearch.js/issues/2102)
* **dev:docs:** dont watch `/docgen/rootFiles` ([ab1a7f5](https://github.com/algolia/instantsearch.js/commit/ab1a7f5))
* **doc:** add doc for isFirstRendering ([cea6739](https://github.com/algolia/instantsearch.js/commit/cea6739))
* **docs:** dont filter out `p.type.type` ([881659a](https://github.com/algolia/instantsearch.js/commit/881659a))
* **documentation.js:** Support for record types ([219ecd9](https://github.com/algolia/instantsearch.js/commit/219ecd9))
* **documentationjs:** add support litteral string types in type format ([2a08e7d](https://github.com/algolia/instantsearch.js/commit/2a08e7d))
* **documentationjs:** deeper related types ([6e3121e](https://github.com/algolia/instantsearch.js/commit/6e3121e))
* **documentationjs:** find related type in TypeApplication ([e0487ee](https://github.com/algolia/instantsearch.js/commit/e0487ee))
* **documentationjs:** fix 2+ depth structs ([4c8b7ec](https://github.com/algolia/instantsearch.js/commit/4c8b7ec))
* **documentationjs:** fixed default value parameter ([b62cbc7](https://github.com/algolia/instantsearch.js/commit/b62cbc7))
* **documentationjs:** records display with , ([8a968f2](https://github.com/algolia/instantsearch.js/commit/8a968f2))
* **documentationjs:** Updgrade to RC + fixes ([e9f0361](https://github.com/algolia/instantsearch.js/commit/e9f0361))
* **infinite-hits:** Remove hitsPerPage option (#2128) ([c13e377](https://github.com/algolia/instantsearch.js/commit/c13e377))
* **live-example:** adapt regex for matching connectors ([774254c](https://github.com/algolia/instantsearch.js/commit/774254c))
* **pagination:** fix zealous find/replace ([e269d87](https://github.com/algolia/instantsearch.js/commit/e269d87))
* **price-ranges:** fix test ([fd65cb3](https://github.com/algolia/instantsearch.js/commit/fd65cb3))
* **price-ranges:** New API uses ranges ([a5a6916](https://github.com/algolia/instantsearch.js/commit/a5a6916))
* **refinementList:** reimplement show more on refinement list ([72655ab](https://github.com/algolia/instantsearch.js/commit/72655ab))
* **refinementList:** sffv fix thanks [@julienpa](https://github.com/julienpa) ([30e0e9a](https://github.com/algolia/instantsearch.js/commit/30e0e9a))
* **sffv:** Fix exhaustive facets ([0cadcc3](https://github.com/algolia/instantsearch.js/commit/0cadcc3))
* **sortby:** Consistent across widget / connectors + migration ([8e366cc](https://github.com/algolia/instantsearch.js/commit/8e366cc))
* **widgets/price-ranges:** wrong compute of `templateProps` ([be5e063](https://github.com/algolia/instantsearch.js/commit/be5e063))


### Features

* **connectHierarchicalMenu:** remove `currentRefinement` ([3912aaf](https://github.com/algolia/instantsearch.js/commit/3912aaf))
* **connectHits:** typo `widgetOptions` -> `widgetParams` ([4420231](https://github.com/algolia/instantsearch.js/commit/4420231))
* **connector:** Add hierarchical menu connector ([f727949](https://github.com/algolia/instantsearch.js/commit/f727949))
* **connector:** add infinite hits connector ([cdf8675](https://github.com/algolia/instantsearch.js/commit/cdf8675))
* **connector:** add instantsearchInstance to pagination render ([4fa96dc](https://github.com/algolia/instantsearch.js/commit/4fa96dc))
* **connector:** add missing jsDoc descriptions ([e26e8e2](https://github.com/algolia/instantsearch.js/commit/e26e8e2))
* **connector:** add range-slider ([1a02798](https://github.com/algolia/instantsearch.js/commit/1a02798))
* **connector:** add tests for connectClearAll and connectHierarchicalMenu ([0eb29ec](https://github.com/algolia/instantsearch.js/commit/0eb29ec))
* **connector:** Adds hits and menu connectors ([77083b7](https://github.com/algolia/instantsearch.js/commit/77083b7))
* **connector:** Clear and CurrentRefinedValues ([02f7d3e](https://github.com/algolia/instantsearch.js/commit/02f7d3e))
* **connector:** clearAll connector (iteration 2) ([90aa02e](https://github.com/algolia/instantsearch.js/commit/90aa02e))
* **connector:** clearAll jsDoc + eslint fixes ([430a420](https://github.com/algolia/instantsearch.js/commit/430a420))
* **connector:** complete jsdoc + pass instantsearch to view ([e125931](https://github.com/algolia/instantsearch.js/commit/e125931))
* **connector:** connectClearAll documentation ([9b153aa](https://github.com/algolia/instantsearch.js/commit/9b153aa))
* **connector:** connectClearAll iteration 2 (fix) ([03653f1](https://github.com/algolia/instantsearch.js/commit/03653f1))
* **connector:** connectClearAll test ([5409157](https://github.com/algolia/instantsearch.js/commit/5409157))
* **connector:** connectCurrentRefinedValues (iteration 2) ([68408de](https://github.com/algolia/instantsearch.js/commit/68408de))
* **connector:** connectHierarchicalMenu (iteration 2) ([589454c](https://github.com/algolia/instantsearch.js/commit/589454c))
* **connector:** connectHierarchicalMenu jsDoc ([e166090](https://github.com/algolia/instantsearch.js/commit/e166090))
* **connector:** connectHits (iteration 2) ([bca09af](https://github.com/algolia/instantsearch.js/commit/bca09af))
* **connector:** connectHitsPerPageSelector (iteration 2) ([26bb273](https://github.com/algolia/instantsearch.js/commit/26bb273))
* **connector:** connectInfiniteHits (iteration 2) ([410459c](https://github.com/algolia/instantsearch.js/commit/410459c))
* **connector:** connectNumericRefinementList (iteration 2) ([bfcf860](https://github.com/algolia/instantsearch.js/commit/bfcf860))
* **connector:** connectNumericSelector (iteration 2) ([1eda8a2](https://github.com/algolia/instantsearch.js/commit/1eda8a2))
* **connector:** connectNumericSelector jsDoc ([760fcea](https://github.com/algolia/instantsearch.js/commit/760fcea))
* **connector:** connectRefinementList jsdoc + start document bool isFirstRendering ([52d13de](https://github.com/algolia/instantsearch.js/commit/52d13de))
* **connector:** connectStats second iteration ([82b1cb3](https://github.com/algolia/instantsearch.js/commit/82b1cb3))
* **connector:** connectToggle second iteration ([73b0878](https://github.com/algolia/instantsearch.js/commit/73b0878))
* **connector:** fix createURL usage to generate correct urls ([fdf59d7](https://github.com/algolia/instantsearch.js/commit/fdf59d7))
* **connector:** fix no param usage on custom infiniteHits ([961348a](https://github.com/algolia/instantsearch.js/commit/961348a))
* **connector:** fix parameter consistency in connectClearAll ([9ddffd8](https://github.com/algolia/instantsearch.js/commit/9ddffd8))
* **connector:** Fix parameters for toggle connector ([f96671c](https://github.com/algolia/instantsearch.js/commit/f96671c))
* **connector:** hits-per-page-selector connector refactoring ([dd794e0](https://github.com/algolia/instantsearch.js/commit/dd794e0))
* **connector:** jsDoc + check rendering function ([86f9739](https://github.com/algolia/instantsearch.js/commit/86f9739))
* **connector:** jsDoc connectPagination ([3b284de](https://github.com/algolia/instantsearch.js/commit/3b284de))
* **connector:** jsDoc for connectMenu ([626d5f1](https://github.com/algolia/instantsearch.js/commit/626d5f1))
* **connector:** jsDoc updates ([c924043](https://github.com/algolia/instantsearch.js/commit/c924043))
* **connector:** move clearAll as a rendering option ([ce41cde](https://github.com/algolia/instantsearch.js/commit/ce41cde))
* **connector:** Numeric selector ([0dc42d2](https://github.com/algolia/instantsearch.js/commit/0dc42d2))
* **connector:** numericRefinementList connector ([918d971](https://github.com/algolia/instantsearch.js/commit/918d971))
* **connector:** pagination connector ([7a876f3](https://github.com/algolia/instantsearch.js/commit/7a876f3))
* **connector:** price ranges connector ([d8bed96](https://github.com/algolia/instantsearch.js/commit/d8bed96))
* **connector:** provide consistent interface for searchbox renderer ([17d8301](https://github.com/algolia/instantsearch.js/commit/17d8301))
* **connector:** provide instantsearch instance at render ([12a7935](https://github.com/algolia/instantsearch.js/commit/12a7935))
* **connector:** refactor search function ([618dca2](https://github.com/algolia/instantsearch.js/commit/618dca2))
* **connector:** refinement list connector ([c8fcf4e](https://github.com/algolia/instantsearch.js/commit/c8fcf4e))
* **connector:** remove legacy implementation of toggle ([04437b0](https://github.com/algolia/instantsearch.js/commit/04437b0))
* **connector:** remove non relevant instantsearch API from test ([c5dce5c](https://github.com/algolia/instantsearch.js/commit/c5dce5c))
* **connector:** remove unused parameter to searchbox connector ([e639f65](https://github.com/algolia/instantsearch.js/commit/e639f65))
* **connector:** searchbox connector ([70f8e1f](https://github.com/algolia/instantsearch.js/commit/70f8e1f))
* **connector:** small internal refactoring for SFFV ([cb5c1fa](https://github.com/algolia/instantsearch.js/commit/cb5c1fa))
* **connector:** sort by selector connector ([b9847cf](https://github.com/algolia/instantsearch.js/commit/b9847cf))
* **connector:** star rating connector ([9996b4d](https://github.com/algolia/instantsearch.js/commit/9996b4d))
* **connector:** stats connector ([680743b](https://github.com/algolia/instantsearch.js/commit/680743b))
* **connector:** test connectHits ([89c86a5](https://github.com/algolia/instantsearch.js/commit/89c86a5))
* **connector:** test connectHitsPerPageSelector ([9caab02](https://github.com/algolia/instantsearch.js/commit/9caab02))
* **connector:** test connectInfiniteHits ([e67e75e](https://github.com/algolia/instantsearch.js/commit/e67e75e))
* **connector:** test connectMenu ([03c6f11](https://github.com/algolia/instantsearch.js/commit/03c6f11))
* **connector:** test connectNumericRefinementList ([2f26251](https://github.com/algolia/instantsearch.js/commit/2f26251))
* **connector:** test connectNumericSelector ([182779b](https://github.com/algolia/instantsearch.js/commit/182779b))
* **connector:** test connectPagination ([6f125b7](https://github.com/algolia/instantsearch.js/commit/6f125b7))
* **connector:** test connectPriceRanges ([f5dfba7](https://github.com/algolia/instantsearch.js/commit/f5dfba7))
* **connector:** test connectRangeSlider ([4f6c180](https://github.com/algolia/instantsearch.js/commit/4f6c180))
* **connector:** test connectSearchBox ([b4d7e1b](https://github.com/algolia/instantsearch.js/commit/b4d7e1b))
* **connector:** test connectSortBySelector ([e8825df](https://github.com/algolia/instantsearch.js/commit/e8825df))
* **connector:** test connectStarRating ([0c16f15](https://github.com/algolia/instantsearch.js/commit/0c16f15)), closes [#2002](https://github.com/algolia/instantsearch.js/issues/2002)
* **connector:** test connectStats ([c992288](https://github.com/algolia/instantsearch.js/commit/c992288))
* **connector:** test connectToggle ([441293d](https://github.com/algolia/instantsearch.js/commit/441293d))
* **connector:** toggle connector ([bf9a9c0](https://github.com/algolia/instantsearch.js/commit/bf9a9c0))
* **connector:** update doc, move setValue to refine in SortBySelector ([2486f36](https://github.com/algolia/instantsearch.js/commit/2486f36))
* **connector:** update jsDoc descriptions ([f83022a](https://github.com/algolia/instantsearch.js/commit/f83022a))
* **connectors:** `refinement-list` widget (iteration2) ([1c6c3a5](https://github.com/algolia/instantsearch.js/commit/1c6c3a5))
* **connectors:** `setValue()` -> `refine()` / `currentValue` -> `currentRefinement` ([ec7806c](https://github.com/algolia/instantsearch.js/commit/ec7806c))
* **connectors:** `sortBy` to `['isRefined', 'count:desc']` ([01219f1](https://github.com/algolia/instantsearch.js/commit/01219f1))
* **connectors:** add `currentRefinement` on `hierarchical-menu` ([154cdb5](https://github.com/algolia/instantsearch.js/commit/154cdb5))
* **connectors:** connectPagination (iteration2) ([8a615f6](https://github.com/algolia/instantsearch.js/commit/8a615f6))
* **connectors:** connectPriceRanges (iteration2) ([e34968e](https://github.com/algolia/instantsearch.js/commit/e34968e))
* **connectors:** connectRangeSlider (iteration2) ([6073d94](https://github.com/algolia/instantsearch.js/commit/6073d94))
* **connectors:** connectSearchBox (iteration2) ([3161c9b](https://github.com/algolia/instantsearch.js/commit/3161c9b))
* **connectors:** connectSortBySelector (iteration 2) ([dec2d31](https://github.com/algolia/instantsearch.js/commit/dec2d31))
* **connectors:** connectStarRating (iteration2) ([7ef7b6b](https://github.com/algolia/instantsearch.js/commit/7ef7b6b))
* **connectors:** connectToggle, forward initial options to render ([704a455](https://github.com/algolia/instantsearch.js/commit/704a455))
* **connectors:** dissociate logic & view for `menu` widget ([5a02c88](https://github.com/algolia/instantsearch.js/commit/5a02c88))
* **connectors:** expose connectors on `instantsearch` instance ([ff799d0](https://github.com/algolia/instantsearch.js/commit/ff799d0))
* **connectors:** forward `widgetParams` to `renderFn` ([54222a3](https://github.com/algolia/instantsearch.js/commit/54222a3))
* **connectors:** jsDoc connectHitsPerPageSelector ([75243b0](https://github.com/algolia/instantsearch.js/commit/75243b0))
* **connectors:** provide `currentRefinement` on menu ([fb7bc5e](https://github.com/algolia/instantsearch.js/commit/fb7bc5e))
* **connectors:** provide `currentRefinement` on numeric refinement list ([91f7928](https://github.com/algolia/instantsearch.js/commit/91f7928))
* **connectors.numeric-selector:** `currentValue` -> `currentRefinement` / `setValue()` -> `refine()` ([998faf1](https://github.com/algolia/instantsearch.js/commit/998faf1))
* **connectors.price-ranges:** provides `currentRefiment` value ([39af437](https://github.com/algolia/instantsearch.js/commit/39af437))
* **connectors.refinement-list:** provide `currentRefinement` to `renderFn` ([7e86be3](https://github.com/algolia/instantsearch.js/commit/7e86be3))
* **connectors.star-rating:** provide `currentRefinement` value ([c08b3e4](https://github.com/algolia/instantsearch.js/commit/c08b3e4))
* **connectRefinementList:** first good iteration ([88fd6d5](https://github.com/algolia/instantsearch.js/commit/88fd6d5))
* **doc:** re-bootstrap doc based on instantsearch-android ([e4e816e](https://github.com/algolia/instantsearch.js/commit/e4e816e))
* **docs:** bootstrap v2 docs ([0db6caf](https://github.com/algolia/instantsearch.js/commit/0db6caf))
* **docs:** pages structure ([fe89dcf](https://github.com/algolia/instantsearch.js/commit/fe89dcf))
* **getting-started:** add `.zip` boilerplate ([7d3769c](https://github.com/algolia/instantsearch.js/commit/7d3769c))
* **getting-started:** add result example of guide ([78d9017](https://github.com/algolia/instantsearch.js/commit/78d9017))
* **live-example:** add support of connectors ([e4f3158](https://github.com/algolia/instantsearch.js/commit/e4f3158))
* **live-example:** include jquery on connectors example pages ([f32936f](https://github.com/algolia/instantsearch.js/commit/f32936f))
* **main:** export all the widgets at once ([4bc2d21](https://github.com/algolia/instantsearch.js/commit/4bc2d21))
* **numeric-refinement-list:** `facetValues` -> `items` / `toggleRefinement` -> `refine` ([eb2c993](https://github.com/algolia/instantsearch.js/commit/eb2c993))
* **pagination:** `setPage()` -> `refine()` / `currentPage` -> `currentRefinement` ([f783fea](https://github.com/algolia/instantsearch.js/commit/f783fea))
* **range-slider:** use `rheostat` as slider component (#2142) ([910a0a0](https://github.com/algolia/instantsearch.js/commit/910a0a0))
* **searchFunction:** Update API, fix #1924 ([c7beb1d](https://github.com/algolia/instantsearch.js/commit/c7beb1d)), closes [#1924](https://github.com/algolia/instantsearch.js/issues/1924)
* **sort-by-selector:** `currentValue` -> `currentRefinement` ([e94c8c7](https://github.com/algolia/instantsearch.js/commit/e94c8c7))
* **Template:** remove support for react element ([ca2ab44](https://github.com/algolia/instantsearch.js/commit/ca2ab44))



<a name="1.11.15"></a>
## [1.11.15](https://github.com/algolia/instantsearch.js/compare/v1.11.14...v1.11.15) (2017-06-20)


### Bug Fixes

* **numeric-refinement-list:** reset page on refine ([ee55ccb](https://github.com/algolia/instantsearch.js/commit/ee55ccb))



<a name="1.11.14"></a>
## [1.11.14](https://github.com/algolia/instantsearch.js/compare/v1.11.13...v1.11.14) (2017-06-19)


### Bug Fixes

* **powered-by:** update logo ([7e68b51](https://github.com/algolia/instantsearch.js/commit/7e68b51)), closes [#2126](https://github.com/algolia/instantsearch.js/issues/2126)



<a name="1.11.13"></a>
## [1.11.13](https://github.com/algolia/instantsearch.js/compare/v1.11.12...v1.11.13) (2017-06-07)


### Bug Fixes

* **url-sync:** reverting back to using `change` event (#2183) ([07f4be0](https://github.com/algolia/instantsearch.js/commit/07f4be0)), closes [#2173](https://github.com/algolia/instantsearch.js/issues/2173) [#2171](https://github.com/algolia/instantsearch.js/issues/2171)



<a name="1.11.12"></a>
## [1.11.12](https://github.com/algolia/instantsearch.js/compare/v1.11.11...v1.11.12) (2017-05-30)


### Bug Fixes

* **sffv:** when using a large limit, retain the search (#2163) ([3d95d4c](https://github.com/algolia/instantsearch.js/commit/3d95d4c)), closes [#2156](https://github.com/algolia/instantsearch.js/issues/2156)



<a name="1.11.10"></a>
## [1.11.10](https://github.com/algolia/instantsearch.js/compare/v1.11.9...v1.11.10) (2017-05-17)



<a name="1.11.9"></a>
## [1.11.9](https://github.com/algolia/instantsearch.js/compare/v1.11.8...v1.11.9) (2017-05-17)



<a name="1.11.8"></a>
## [1.11.8](https://github.com/algolia/instantsearch.js/compare/v1.11.7...v1.11.8) (2017-05-16)


### Bug Fixes

* **url-sync:** set firstRender to be class attribute ([22dbaeb](https://github.com/algolia/instantsearch.js/commit/22dbaeb))



<a name="1.11.7"></a>
## [1.11.7](https://github.com/algolia/instantsearch.js/compare/v1.11.6...v1.11.7) (2017-04-24)


### Bug Fixes

* **sffv:** add class for disabled state at the form level (#2122) ([029fa5f](https://github.com/algolia/instantsearch.js/commit/029fa5f))
* **sffv:** fixes typo (: was left) ([26d2845](https://github.com/algolia/instantsearch.js/commit/26d2845))



<a name="1.11.6"></a>
## [1.11.6](https://github.com/algolia/instantsearch.js/compare/v1.11.5...v1.11.6) (2017-04-20)


### Bug Fixes

* **CONTRIBUTING:** remove section about beta releases (#2109) ([5640131](https://github.com/algolia/instantsearch.js/commit/5640131))
* **sffv:** disable sffv input when few facet values FIX #2111 ([1e33c10](https://github.com/algolia/instantsearch.js/commit/1e33c10)), closes [#2111](https://github.com/algolia/instantsearch.js/issues/2111)



<a name="1.11.5"></a>
## [1.11.5](https://github.com/algolia/instantsearch.js/compare/v1.11.4...v1.11.5) (2017-04-12)


### Bug Fixes

* **url-sync:** sync url on search (#2108) ([7f33ffb](https://github.com/algolia/instantsearch.js/commit/7f33ffb))



<a name="1.11.4"></a>
## [1.11.4](https://github.com/algolia/instantsearch.js/compare/v1.11.3...v1.11.4) (2017-03-29)


### Bug Fixes

* **autoHideContainer:** dont prevent render with `shouldComponentUpdate` (#2076) ([b520400](https://github.com/algolia/instantsearch.js/commit/b520400))
* **star-rating:** make max value inclusive ([f5fc41c](https://github.com/algolia/instantsearch.js/commit/f5fc41c)), closes [#2002](https://github.com/algolia/instantsearch.js/issues/2002)



<a name="1.11.3"></a>
## [1.11.3](https://github.com/algolia/instantsearch.js/compare/v1.11.2...v1.11.3) (2017-03-22)


### Bug Fixes

* **Slider:** display disabled slider when `min === max` (#2041) ([511fdfd](https://github.com/algolia/instantsearch.js/commit/511fdfd)), closes [#2037](https://github.com/algolia/instantsearch.js/issues/2037)



<a name="1.11.2"></a>
## [1.11.2](https://github.com/algolia/instantsearch.js/compare/v1.11.1...v1.11.2) (2017-02-28)


### Bug Fixes

* **searchBox:** avoid unwanted cursor jumps on hashchange (#2013) ([d0103db](https://github.com/algolia/instantsearch.js/commit/d0103db)), closes [#2012](https://github.com/algolia/instantsearch.js/issues/2012)



<a name="1.11.1"></a>
## [1.11.1](https://github.com/algolia/instantsearch.js/compare/v1.11.0...v1.11.1) (2017-02-14)


### Bug Fixes

* **infinite-hits:** disable load more button when no more pages (#1973) ([745ed89](https://github.com/algolia/instantsearch.js/commit/745ed89)), closes [#1971](https://github.com/algolia/instantsearch.js/issues/1971)



<a name="1.11.0"></a>
# [1.11.0](https://github.com/algolia/instantsearch.js/compare/v1.10.5...v1.11.0) (2017-02-12)


### Features

* **analytics-widget:** add a new parameter pushInitialSearch (#1963) ([d777997](https://github.com/algolia/instantsearch.js/commit/d777997))
* **custom client:** allows to provide a custom JS client instance (#1948) ([cce4f2e](https://github.com/algolia/instantsearch.js/commit/cce4f2e))
* **InfiniteHits:** add new widget ([2d77e4b](https://github.com/algolia/instantsearch.js/commit/2d77e4b))



<a name="1.10.5"></a>
## [1.10.5](https://github.com/algolia/instantsearch.js/compare/v1.10.4...v1.10.5) (2017-02-06)


### Bug Fixes

* **urlSync:** update url only after threshold (#1917) ([b0f0cf1](https://github.com/algolia/instantsearch.js/commit/b0f0cf1)), closes [#1856](https://github.com/algolia/instantsearch.js/issues/1856)



<a name="1.10.4"></a>
## [1.10.4](https://github.com/algolia/instantsearch.js/compare/v1.10.3...v1.10.4) (2017-01-25)



<a name="1.10.3"></a>
## [1.10.3](https://github.com/algolia/instantsearch.js/compare/v1.10.2...v1.10.3) (2016-12-26)


### Bug Fixes

* **sffv-searchbox:** update classnames to avoid conflicts (#1781) ([f53e8fd](https://github.com/algolia/instantsearch.js/commit/f53e8fd))



<a name="1.10.2"></a>
## [1.10.2](https://github.com/algolia/instantsearch.js/compare/v1.10.1...v1.10.2) (2016-12-23)


### Bug Fixes

* **url:** clear timeout on pop ([41ad9af](https://github.com/algolia/instantsearch.js/commit/41ad9af))



<a name="1.10.1"></a>
## [1.10.1](https://github.com/algolia/instantsearch.js/compare/v1.10.0...v1.10.1) (2016-12-23)


### Bug Fixes

* **url:** default param ([7a18e1c](https://github.com/algolia/instantsearch.js/commit/7a18e1c))


### Features

* **url:** add a beta updateOnEveryKeystroke option (#1779) ([63f73fe](https://github.com/algolia/instantsearch.js/commit/63f73fe))



<a name="1.10.0"></a>
# [1.10.0](https://github.com/algolia/instantsearch.js/compare/v1.9.0...v1.10.0) (2016-12-22)


### Features

* **widget:** Search for facet values - refinement list (#1753) ([b9e20f3](https://github.com/algolia/instantsearch.js/commit/b9e20f3))



<a name="1.9.0"></a>
# [1.9.0](https://github.com/algolia/instantsearch.js/compare/v1.8.16...v1.9.0) (2016-12-14)


### Bug Fixes

* **currentRefinedValues:** unescape disjunctive facet refinement names (#1574) ([9ab65c4](https://github.com/algolia/instantsearch.js/commit/9ab65c4)), closes [#1569](https://github.com/algolia/instantsearch.js/issues/1569)
* **transformData:** default data is an object when not provided (#1570) ([8eeeeba](https://github.com/algolia/instantsearch.js/commit/8eeeeba)), closes [#1538](https://github.com/algolia/instantsearch.js/issues/1538)


### Features

* **analytics:** new analytics widget to easily plug search to any analytics service ([09d8fda](https://github.com/algolia/instantsearch.js/commit/09d8fda))
* **retry strategy:** new retry strategy ([afdcc3c](https://github.com/algolia/instantsearch.js/commit/afdcc3c))



<a name="1.8.16"></a>
## [1.8.16](https://github.com/algolia/instantsearch.js/compare/v1.8.15...v1.8.16) (2016-11-16)



<a name="1.8.15"></a>
## [1.8.15](https://github.com/algolia/instantsearch.js/compare/v1.8.14...v1.8.15) (2016-11-16)


### Bug Fixes

* **priceRanges:** avoid displaying solo ranges (#1544) ([ff396f0](https://github.com/algolia/instantsearch.js/commit/ff396f0)), closes [#1536](https://github.com/algolia/instantsearch.js/issues/1536)
* **priceRanges:** use formatNumber in defaultTemplate (#1559) ([557a501](https://github.com/algolia/instantsearch.js/commit/557a501)), closes [#1230](https://github.com/algolia/instantsearch.js/issues/1230)
* **toggle:** support negative numeric values for on/off (#1551) ([e4d88e0](https://github.com/algolia/instantsearch.js/commit/e4d88e0)), closes [#1537](https://github.com/algolia/instantsearch.js/issues/1537)
* **transformData:** always call transformData (#1555) ([49bfeca](https://github.com/algolia/instantsearch.js/commit/49bfeca)), closes [#1538](https://github.com/algolia/instantsearch.js/issues/1538)



<a name="1.8.14"></a>
## [1.8.14](https://github.com/algolia/instantsearch.js/compare/v1.8.13...v1.8.14) (2016-11-03)


### Bug Fixes

* **slider:** avoid multi touch issues (#1501) ([0b8a242](https://github.com/algolia/instantsearch.js/commit/0b8a242)), closes [#1186](https://github.com/algolia/instantsearch.js/issues/1186)



<a name="1.8.13"></a>
## [1.8.13](https://github.com/algolia/instantsearch.js/compare/v1.8.12...v1.8.13) (2016-10-21)


### Bug Fixes

* **searchbox:** poweredBy Algolia logo weren't visible in firefox ([39701f8](https://github.com/algolia/instantsearch.js/commit/39701f8))



<a name="1.8.12"></a>
## [1.8.12](https://github.com/algolia/instantsearch.js/compare/v1.8.11...v1.8.12) (2016-10-19)


### Bug Fixes

* **numericRefinementList:** classes on radio buttons (#1358) (#1432) ([fec6495](https://github.com/algolia/instantsearch.js/commit/fec6495))



<a name="1.8.11"></a>
## [1.8.11](https://github.com/algolia/instantsearch.js/compare/v1.8.10...v1.8.11) (2016-10-07)


### Bug Fixes

* **merge:** merge only plain object from searchParameters ([aab1c87](https://github.com/algolia/instantsearch.js/commit/aab1c87))



<a name="1.8.10"></a>
## [1.8.10](https://github.com/algolia/instantsearch.js/compare/v1.8.9...v1.8.10) (2016-10-07)


### Bug Fixes

* **lodash:** set lodash back to 4.15.0, fixes build, unknown issue for now ([ba4247e](https://github.com/algolia/instantsearch.js/commit/ba4247e))



<a name="1.8.9"></a>
## [1.8.9](https://github.com/algolia/instantsearch.js/compare/v1.8.8...v1.8.9) (2016-10-07)


### Bug Fixes

* **react:** avoid duplicating React ([59010f6](https://github.com/algolia/instantsearch.js/commit/59010f6)), closes [#1386](https://github.com/algolia/instantsearch.js/issues/1386)



<a name="1.8.8"></a>
## [1.8.8](https://github.com/algolia/instantsearch.js/compare/v1.8.6...v1.8.8) (2016-09-14)


### Bug Fixes

* **numericSelector:** do not change state on init (#1280) ([cf27db3](https://github.com/algolia/instantsearch.js/commit/cf27db3)), closes [#1253](https://github.com/algolia/instantsearch.js/issues/1253)
* **Slider:** default precision to 2 (#1279) ([552b9ea](https://github.com/algolia/instantsearch.js/commit/552b9ea))



<a name="1.8.6"></a>
## [1.8.6](https://github.com/algolia/instantsearch.js/compare/v1.8.5...v1.8.6) (2016-09-12)



<a name="1.8.5"></a>
## [1.8.5](https://github.com/algolia/instantsearch.js/compare/v1.8.4...v1.8.5) (2016-09-06)


### Bug Fixes

* **deps:** upgrade all deps 2016-09-05 (#1261) ([408d597](https://github.com/algolia/instantsearch.js/commit/408d597))
* **rangeSlider:** round pips numbers when step is integer (#1255) ([b993033](https://github.com/algolia/instantsearch.js/commit/b993033)), closes [#1254](https://github.com/algolia/instantsearch.js/issues/1254)



<a name="1.8.4"></a>
## [1.8.4](https://github.com/algolia/instantsearch.js/compare/v1.8.3...v1.8.4) (2016-08-29)


### Bug Fixes

* **bundle:** switch back to React by default, create a preact build (#1228) ([4845868](https://github.com/algolia/instantsearch.js/commit/4845868))



<a name="1.8.3"></a>
## [1.8.3](https://github.com/algolia/instantsearch.js/compare/v1.8.2...v1.8.3) (2016-08-29)


### Bug Fixes

* **numericSelector:** if no currentValue found, use the first option ([ef56dfa](https://github.com/algolia/instantsearch.js/commit/ef56dfa))
* **poweredBy:** fixed Algolia logo version (#1223) ([aab3fc3](https://github.com/algolia/instantsearch.js/commit/aab3fc3)), closes [#1223](https://github.com/algolia/instantsearch.js/issues/1223) [#1222](https://github.com/algolia/instantsearch.js/issues/1222)
* **Selector:** render a controlled component ([e9f6ff7](https://github.com/algolia/instantsearch.js/commit/e9f6ff7))


### Performance Improvements

* **filesize:** use preact in production build (#1224) ([5bb38f2](https://github.com/algolia/instantsearch.js/commit/5bb38f2)), closes [#1030](https://github.com/algolia/instantsearch.js/issues/1030)



<a name="1.8.2"></a>
## [1.8.2](https://github.com/algolia/instantsearch.js/compare/v1.8.1...v1.8.2) (2016-08-25)


### Bug Fixes

* **lodash:** use lodash v4, reduce build size ([216d1e0](https://github.com/algolia/instantsearch.js/commit/216d1e0))



<a name="1.8.1"></a>
## [1.8.1](https://github.com/algolia/instantsearch.js/compare/v1.8.0...v1.8.1) (2016-08-24)


### Bug Fixes

* **searchBox:** handle BFCache browsers (#1212) ([7deb9c3](https://github.com/algolia/instantsearch.js/commit/7deb9c3))
* **toggle:** make autoHide check facetValue.count (#1213) ([86872eb](https://github.com/algolia/instantsearch.js/commit/86872eb))



<a name="1.8.0"></a>
# [1.8.0](https://github.com/algolia/instantsearch.js/compare/v1.7.1...v1.8.0) (2016-08-18)


### Bug Fixes

* **documentation:** Change instantsearch.widgets.stats typo data.processingTimMS to data.processingTimeMS ([034703e](https://github.com/algolia/instantsearch.js/commit/034703e))
* **documentation:** Change responsiveNavigation.js & header.html to fix #1090 ([bf3a808](https://github.com/algolia/instantsearch.js/commit/bf3a808)), closes [#1090](https://github.com/algolia/instantsearch.js/issues/1090)
* **nouislider:** fix the slider for nouislider 8.5.1 ([af8f56b](https://github.com/algolia/instantsearch.js/commit/af8f56b))


### Features

* **clearAll:** Add optional excludeAttributes to list protected filters ([fe6d19c](https://github.com/algolia/instantsearch.js/commit/fe6d19c))



<a name="1.7.1"></a>
## [1.7.1](https://github.com/algolia/instantsearch.js/compare/v1.7.0...v1.7.1) (2016-07-28)


### Bug Fixes

* **toggle:** add backward compatibility for previous toggle implem (#1154) ([a1973a0](https://github.com/algolia/instantsearch.js/commit/a1973a0))



<a name="1.7.0"></a>
# [1.7.0](https://github.com/algolia/instantsearch.js/compare/v1.6.4...v1.7.0) (2016-07-26)


### Bug Fixes

* **searchParameters:** avoid mutating provided objects (#1148) ([0ea3bef](https://github.com/algolia/instantsearch.js/commit/0ea3bef)), closes [#1130](https://github.com/algolia/instantsearch.js/issues/1130)


### Features

* **toggle:** Provide a better default widget (#1146) ([d54107e](https://github.com/algolia/instantsearch.js/commit/d54107e)), closes [#1096](https://github.com/algolia/instantsearch.js/issues/1096) [#919](https://github.com/algolia/instantsearch.js/issues/919)



<a name="1.6.4"></a>
## [1.6.4](https://github.com/algolia/instantsearch.js/compare/v1.6.3...v1.6.4) (2016-07-12)



<a name="1.6.3"></a>
## [1.6.3](https://github.com/algolia/instantsearch.js/compare/v1.6.2...v1.6.3) (2016-07-11)


### Bug Fixes

* **Hits:** always render hits ([2e7bf8a](https://github.com/algolia/instantsearch.js/commit/2e7bf8a)), closes [#1100](https://github.com/algolia/instantsearch.js/issues/1100)



<a name="1.6.2"></a>
## [1.6.2](https://github.com/algolia/instantsearch.js/compare/v1.6.1...v1.6.2) (2016-07-11)


### Bug Fixes

* **paginationLink:** it's aria-label not ariaLabel (#1125) ([70a190c](https://github.com/algolia/instantsearch.js/commit/70a190c))
* **pricesRange:** fill the form according to the current refinement (#1126) ([12ebde7](https://github.com/algolia/instantsearch.js/commit/12ebde7)), closes [#1009](https://github.com/algolia/instantsearch.js/issues/1009)
* **rangeSlider:** handles now support stacking (#1129) ([ad394d3](https://github.com/algolia/instantsearch.js/commit/ad394d3))
* **rangeSlider:** use stats min/max when only user min or max is provided (#1124) ([4348463](https://github.com/algolia/instantsearch.js/commit/4348463)), closes [#1004](https://github.com/algolia/instantsearch.js/issues/1004)
* **searchBox:** force cursor position to be at the end of the query (#1123) ([8a27769](https://github.com/algolia/instantsearch.js/commit/8a27769)), closes [#946](https://github.com/algolia/instantsearch.js/issues/946)
* **searchBox:** IE8, IE9 needs to listen for setQuery ([97c166a](https://github.com/algolia/instantsearch.js/commit/97c166a))
* **searchBox:** update helper query on every keystroke (#1127) ([997c0c2](https://github.com/algolia/instantsearch.js/commit/997c0c2)), closes [#1015](https://github.com/algolia/instantsearch.js/issues/1015)
* **urlSync:** urls should be safe by default (#1104) ([db833c6](https://github.com/algolia/instantsearch.js/commit/db833c6)), closes [#982](https://github.com/algolia/instantsearch.js/issues/982)



<a name="1.6.1"></a>
## [1.6.1](https://github.com/algolia/instantsearch.js/compare/v1.6.0...v1.6.1) (2016-06-20)


### Bug Fixes

* **meteorjs:** lite build must point to the browser lite (#1097) ([265ace3](https://github.com/algolia/instantsearch.js/commit/265ace3))
* **toggle:** read numerical facet results stats for toggle count (#1098) ([1feb539](https://github.com/algolia/instantsearch.js/commit/1feb539)), closes [#1096](https://github.com/algolia/instantsearch.js/issues/1096)
* **website:** footer wording ([8355460](https://github.com/algolia/instantsearch.js/commit/8355460))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/algolia/instantsearch.js/compare/v1.5.2...v1.6.0) (2016-06-13)


### Bug Fixes

* **hits:** rename __position to hitIndex ([d051a54](https://github.com/algolia/instantsearch.js/commit/d051a54))
* **refinementList/header:** rename count to refinedFacetCount ([89ad602](https://github.com/algolia/instantsearch.js/commit/89ad602))

### Features

* **header:** Pass count of current refined filters in header ([d9e8582](https://github.com/algolia/instantsearch.js/commit/d9e8582)), closes [#1013](https://github.com/algolia/instantsearch.js/issues/1013) [#1041](https://github.com/algolia/instantsearch.js/issues/1041)
* **hits:** Add a `__position` attribute to data passed to items ([43ce1c7](https://github.com/algolia/instantsearch.js/commit/43ce1c7)), closes [#903](https://github.com/algolia/instantsearch.js/issues/903)



<a name="1.5.2"></a>
## [1.5.2](https://github.com/algolia/instantsearch.js/compare/v1.5.1...v1.5.2) (2016-06-10)


### Bug Fixes

* **lite:** use lite algoliasearch build (js client) ([219fa9f](https://github.com/algolia/instantsearch.js/commit/219fa9f)), closes [#1024](https://github.com/algolia/instantsearch.js/issues/1024)
* **poweredBy:** Let users define their own poweredBy template ([f1a96d8](https://github.com/algolia/instantsearch.js/commit/f1a96d8))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/algolia/instantsearch.js/compare/v1.5.0...v1.5.1) (2016-05-17)


### Bug Fixes

* **numericRefinementList:** Correctly apply active class ([7cca9a4](https://github.com/algolia/instantsearch.js/commit/7cca9a4)), closes [#1010](https://github.com/algolia/instantsearch.js/issues/1010)



<a name="1.5.0"></a>
# [1.5.0](https://github.com/algolia/instantsearch.js/compare/v1.4.5...v1.5.0) (2016-04-29)


### Bug Fixes

* **base href:** always create absolute URLS in widgets ([ae6dbf6](https://github.com/algolia/instantsearch.js/commit/ae6dbf6)), closes [#970](https://github.com/algolia/instantsearch.js/issues/970)
* **IE11:** classList do not supports .add(class, class) ([ab10347](https://github.com/algolia/instantsearch.js/commit/ab10347)), closes [#989](https://github.com/algolia/instantsearch.js/issues/989)
* **lifecycle:** save configuration done in widget.init ([07d1fea](https://github.com/algolia/instantsearch.js/commit/07d1fea))
* **RefinementList:** use attributeNameKey when calling createURL ([253ec28](https://github.com/algolia/instantsearch.js/commit/253ec28))
* **rootpath:** remember rootpath option on 'back' button ([01ecdaa](https://github.com/algolia/instantsearch.js/commit/01ecdaa))
* **searchBox:** do not trigger a search when input value is the same ([81c2e80](https://github.com/algolia/instantsearch.js/commit/81c2e80))
* **urlSync:** only start watching for changes at first render ([4a672ae](https://github.com/algolia/instantsearch.js/commit/4a672ae))

### Features

* **urlSync:** allow overriding replaceState(state)/pushState(state) ([989856c](https://github.com/algolia/instantsearch.js/commit/989856c))



<a name="1.4.5"></a>
## [1.4.5](https://github.com/algolia/instantsearch.js/compare/v1.4.4...v1.4.5) (2016-04-18)


### Bug Fixes

* **showMore:** hide "show less" when nothing to hide ([5ac2bb6](https://github.com/algolia/instantsearch.js/commit/5ac2bb6))



<a name="1.4.4"></a>
## [1.4.4](https://github.com/algolia/instantsearch.js/compare/v1.4.3...v1.4.4) (2016-04-15)


### Bug Fixes

* **pagination:** Disabled pagination link can no longer be clicked ([88b567f](https://github.com/algolia/instantsearch.js/commit/88b567f)), closes [#974](https://github.com/algolia/instantsearch.js/issues/974)
* **showMore:** hide showMore when no more facet values to show ([cc31b1a](https://github.com/algolia/instantsearch.js/commit/cc31b1a))



<a name="1.4.3"></a>
## [1.4.3](https://github.com/algolia/instantsearch.js/compare/v1.4.2...v1.4.3) (2016-04-01)


### Bug Fixes

* **rangeSlider:** step accepts a float value ([6ecc925](https://github.com/algolia/instantsearch.js/commit/6ecc925))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/algolia/instantsearch.js/compare/v1.4.1...v1.4.2) (2016-03-24)


### Performance Improvements

* **refinementList:** Stop creating URL for hidden refinements. ([2cdd17d](https://github.com/algolia/instantsearch.js/commit/2cdd17d))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/algolia/instantsearch.js/compare/v1.4.0...v1.4.1) (2016-03-22)


### Bug Fixes

* **searchBox:** do not update the input when focused ([61cf9be](https://github.com/algolia/instantsearch.js/commit/61cf9be)), closes [#944](https://github.com/algolia/instantsearch.js/issues/944)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/algolia/instantsearch.js/compare/v1.3.3...v1.4.0) (2016-03-16)


### Bug Fixes

* **url:** allow hierarchical facets in trackedParameters ([36b4011](https://github.com/algolia/instantsearch.js/commit/36b4011))

### Features

* **url-sync:** use the new mapping option ([f869885](https://github.com/algolia/instantsearch.js/commit/f869885)), closes [#838](https://github.com/algolia/instantsearch.js/issues/838)



<a name="1.3.3"></a>
## [1.3.3](https://github.com/algolia/instantsearch.js/compare/v1.3.2...v1.3.3) (2016-03-07)


### Bug Fixes

* **headerFooter:** make collapsible click handler work ([add0d50](https://github.com/algolia/instantsearch.js/commit/add0d50))

### Performance Improvements

* **linters:** Greatly improve the `npm run lint` task speed ([1ba53b0](https://github.com/algolia/instantsearch.js/commit/1ba53b0))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/algolia/instantsearch.js/compare/v1.3.1...v1.3.2) (2016-03-07)


### Bug Fixes

* **Template:** stop leaking `data="[object Object]"` attributes in production builds ([7ec0431](https://github.com/algolia/instantsearch.js/commit/7ec0431)), closes [#899](https://github.com/algolia/instantsearch.js/issues/899)

### Features

* **validate-pr:** Allow `docs()` commits to be merged in master ([0abc689](https://github.com/algolia/instantsearch.js/commit/0abc689))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/algolia/instantsearch.js/compare/v1.3.0...v1.3.1) (2016-03-07)


### Bug Fixes

* **collapsible:** stop duplicating collapsible styling ([7362901](https://github.com/algolia/instantsearch.js/commit/7362901))
* **lodash:** stop leaking lodash in the global scope ([91f71dc](https://github.com/algolia/instantsearch.js/commit/91f71dc)), closes [#900](https://github.com/algolia/instantsearch.js/issues/900)



<a name="1.3.0"></a>
# [1.3.0](https://github.com/algolia/instantsearch.js/compare/v1.2.5...v1.3.0) (2016-03-04)


### Bug Fixes

* **browser support:** make IE lte 10 work by fixing Object.getPrototypeOf ([bbb264b](https://github.com/algolia/instantsearch.js/commit/bbb264b))
* **menu,refinementList:** sort by count AND name to avoid reorders on refine ([02fe7bf](https://github.com/algolia/instantsearch.js/commit/02fe7bf)), closes [#65](https://github.com/algolia/instantsearch.js/issues/65)
* **priceRanges:** pass the bound refine to the form ([ce2b956](https://github.com/algolia/instantsearch.js/commit/ce2b956))
* **searchBox:** handle external updates of the query ([6a0af14](https://github.com/algolia/instantsearch.js/commit/6a0af14)), closes [#803](https://github.com/algolia/instantsearch.js/issues/803)
* **searchBox:** stop setting the query twice ([91270b2](https://github.com/algolia/instantsearch.js/commit/91270b2))
* **searchBox:** stop updating query at eachkeystroke with searchOnEnterKeyPressOnly ([28dc4d2](https://github.com/algolia/instantsearch.js/commit/28dc4d2)), closes [#875](https://github.com/algolia/instantsearch.js/issues/875)
* **Slider:** do not render Slider when range.min === range.max ([f20274e](https://github.com/algolia/instantsearch.js/commit/f20274e))
* **Template:** now render() when templateKey changes ([8906224](https://github.com/algolia/instantsearch.js/commit/8906224))
* **toggle:** pass isRefined to toggleRefinement ([8ac494e](https://github.com/algolia/instantsearch.js/commit/8ac494e))
* **url-sync:** always decode incoming query string ([bea38e3](https://github.com/algolia/instantsearch.js/commit/bea38e3)), closes [#848](https://github.com/algolia/instantsearch.js/issues/848)
* **url-sync:** handle <base> href pages ([e58aadc](https://github.com/algolia/instantsearch.js/commit/e58aadc)), closes [#790](https://github.com/algolia/instantsearch.js/issues/790)

### Features

* **collapsable widgets:** add collapsable and collapsed option ([c4df7c5](https://github.com/algolia/instantsearch.js/commit/c4df7c5))
* **instantsearch:** allow overriding the helper.search function ([9a930e7](https://github.com/algolia/instantsearch.js/commit/9a930e7))
* **rangeSlider:** allow passing min and max values ([409295c](https://github.com/algolia/instantsearch.js/commit/409295c)), closes [#858](https://github.com/algolia/instantsearch.js/issues/858)
* **searchBox:** allow to pass a queryHook ([5786a64](https://github.com/algolia/instantsearch.js/commit/5786a64))
* **Template:** allow template functions to return a React element ([748077d](https://github.com/algolia/instantsearch.js/commit/748077d))
* **Template:** allow template functions to return a React element ([0f9296d](https://github.com/algolia/instantsearch.js/commit/0f9296d))

### Performance Improvements

* **autoHideContainer:** stop re-creating React components ([8c89862](https://github.com/algolia/instantsearch.js/commit/8c89862))
* **formatting numbers:** stop using a default locale, use the system one ([b056554](https://github.com/algolia/instantsearch.js/commit/b056554))
* **nouislider:** upgrade nouislider, shaves some more ms ([fefbe65](https://github.com/algolia/instantsearch.js/commit/fefbe65))
* **React:** use babel `optimisation` option for React ([95f940c](https://github.com/algolia/instantsearch.js/commit/95f940c))
* **React, widgets:** implement shouldComponentUpdate, reduce bind ([5efaac1](https://github.com/algolia/instantsearch.js/commit/5efaac1))



<a name="1.2.5"></a>
## [1.2.5](https://github.com/algolia/instantsearch.js/compare/v1.2.4...v1.2.5) (2016-03-02)


### Bug Fixes

* **hierarchicalMenu:** configure maxValuesPerFacet using the limit option ([4868717](https://github.com/algolia/instantsearch.js/commit/4868717)), closes [#66](https://github.com/algolia/instantsearch.js/issues/66)



<a name="1.2.4"></a>
## [1.2.4](https://github.com/algolia/instantsearch.js/compare/v1.2.3...v1.2.4) (2016-02-29)

Upgraded the helper to 2.9.0 to support undocumented parameters from the API.


<a name="1.2.3"></a>
## [1.2.3](https://github.com/algolia/instantsearch.js/compare/v1.2.2...v1.2.3) (2016-02-18)


### Bug Fixes

* **currentRefinedValues:** clear numeric refinements using original value ([9a0ad45](https://github.com/algolia/instantsearch.js/commit/9a0ad45)), closes [#844](https://github.com/algolia/instantsearch.js/issues/844)



<a name="1.2.2"></a>
## [1.2.2](https://github.com/algolia/instantsearch.js/compare/v1.2.1...v1.2.2) (2016-02-03)


### Features

* **menu:** add showMore option ([e7e7677](https://github.com/algolia/instantsearch.js/commit/e7e7677)), closes [#815](https://github.com/algolia/instantsearch.js/issues/815)



<a name="1.2.1"></a>
## [1.2.1](https://github.com/algolia/instantsearch.js/compare/v1.2.0...v1.2.1) (2016-02-02)


### Bug Fixes

* **showmore:** now showMore in doc and also show-more BEM ([a020439](https://github.com/algolia/instantsearch.js/commit/a020439))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/algolia/instantsearch.js/compare/v1.1.3...v1.2.0) (2016-02-02)


### Bug Fixes

* **all:** typos ([fa8ba09](https://github.com/algolia/instantsearch.js/commit/fa8ba09))
* **currentRefinedValues:** allow array of strings for cssClasses.* ([55b3a3f](https://github.com/algolia/instantsearch.js/commit/55b3a3f))
* **docs:** fixed bad link to scss in custom themes section ([823a859](https://github.com/algolia/instantsearch.js/commit/823a859))
* **getRefinements:** a name should be a string ([7efd1fd](https://github.com/algolia/instantsearch.js/commit/7efd1fd))
* **getRefinements:** hierarchical facets ([fe0fc5d](https://github.com/algolia/instantsearch.js/commit/fe0fc5d))
* **index:** Use module.exports instead of export on index ([81e7eee](https://github.com/algolia/instantsearch.js/commit/81e7eee))
* **pagination:** remove default value of maxPages. Fixes #761 ([607fe9a](https://github.com/algolia/instantsearch.js/commit/607fe9a)), closes [#761](https://github.com/algolia/instantsearch.js/issues/761)
* **prepareTemplates:** uses templates with keys that are not in defaults ([c4bf8ec](https://github.com/algolia/instantsearch.js/commit/c4bf8ec))
* **rangeSlider:**     prevent slider from extending farther than the last pip ([6e534f5](https://github.com/algolia/instantsearch.js/commit/6e534f5))
* **search-box:** update value when state changes from the outside ([4550f99](https://github.com/algolia/instantsearch.js/commit/4550f99))
* **url-sync:** adds indexName in the helper configuration ([e50bafd](https://github.com/algolia/instantsearch.js/commit/e50bafd))
* **url-sync:** Makes url sync more reliable ([3157abc](https://github.com/algolia/instantsearch.js/commit/3157abc)), closes [#730](https://github.com/algolia/instantsearch.js/issues/730) [#729](https://github.com/algolia/instantsearch.js/issues/729)

### Features

* **currentRefinedValues:** new widget ([6c926d0](https://github.com/algolia/instantsearch.js/commit/6c926d0)), closes [#404](https://github.com/algolia/instantsearch.js/issues/404)
* **hits:** adds allItems template as an alternative to item ([1f3f889](https://github.com/algolia/instantsearch.js/commit/1f3f889))
* **poweredBy:** automatically add utm link to poweredBy ([05d1425](https://github.com/algolia/instantsearch.js/commit/05d1425)), closes [#711](https://github.com/algolia/instantsearch.js/issues/711)
* **priceRanges:** add currency option ([f41484a](https://github.com/algolia/instantsearch.js/commit/f41484a))
* **refinementlist:** lets configure showmore feature ([3b8688a](https://github.com/algolia/instantsearch.js/commit/3b8688a))
* **Template:** accepts any parameters and forwards them ([5170f53](https://github.com/algolia/instantsearch.js/commit/5170f53))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/algolia/instantsearch.js/compare/v1.1.2...v1.1.3) (2016-01-12)


### Bug Fixes

* **searchBox:** fixes cssClasses option ([660ee2f](https://github.com/algolia/instantsearch.js/commit/660ee2f)), closes [#775](https://github.com/algolia/instantsearch.js/issues/775)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/algolia/instantsearch.js/compare/v1.1.1...v1.1.2) (2016-01-08)




<a name="1.1.1"></a>
## [1.1.1](https://github.com/algolia/instantsearch.js/compare/v1.1.0...v1.1.1) (2016-01-07)


### Bug Fixes

* **style:** keyframes ([40eb0a5](https://github.com/algolia/instantsearch.js/commit/40eb0a5))
* **url-sync:** adds indexName in the helper configuration ([c2c0bc7](https://github.com/algolia/instantsearch.js/commit/c2c0bc7))

### Features

* **clearRefinements:** Added two utils methods ([49564e1](https://github.com/algolia/instantsearch.js/commit/49564e1))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/algolia/instantsearch.js/compare/v1.0.0...v1.1.0) (2015-11-26)


### Bug Fixes

* **pagination:** fix #668 edge case ([d8f1196](https://github.com/algolia/instantsearch.js/commit/d8f1196)), closes [#668](https://github.com/algolia/instantsearch.js/issues/668)
* **priceRanges:** Remove round from first range ([bf82395](https://github.com/algolia/instantsearch.js/commit/bf82395))
* **slider:** hide the slider when stats.min=stats.max ([42e4b64](https://github.com/algolia/instantsearch.js/commit/42e4b64))
* **starRating:** Retrieve the correct count and use numericRefinement ([f00ce38](https://github.com/algolia/instantsearch.js/commit/f00ce38)), closes [#615](https://github.com/algolia/instantsearch.js/issues/615)

### Features

* **hierarchical:** expose rootPath and showParentLevel ([6e9bb7c](https://github.com/algolia/instantsearch.js/commit/6e9bb7c))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/algolia/instantsearch.js/compare/v0.14.9...v1.0.0) (2015-11-18)




<a name="0.14.9"></a>
## [0.14.9](https://github.com/algolia/instantsearch.js/compare/v0.14.8...v0.14.9) (2015-11-18)




<a name="0.14.8"></a>
## [0.14.8](https://github.com/algolia/instantsearch.js/compare/v0.14.7...v0.14.8) (2015-11-18)




<a name="0.14.7"></a>
## [0.14.7](https://github.com/algolia/instantsearch.js/compare/v0.14.6...v0.14.7) (2015-11-18)




<a name="0.14.6"></a>
## [0.14.6](https://github.com/algolia/instantsearch.js/compare/v0.14.5...v0.14.6) (2015-11-17)




<a name="0.14.5"></a>
## [0.14.5](https://github.com/algolia/instantsearch.js/compare/v0.14.4...v0.14.5) (2015-11-17)




<a name="0.14.4"></a>
## [0.14.4](https://github.com/algolia/instantsearch.js/compare/v0.14.3...v0.14.4) (2015-11-17)


### Bug Fixes

* **doc:** Expand input on documentation page ([6814a14](https://github.com/algolia/instantsearch.js/commit/6814a14))



<a name="0.14.3"></a>
## [0.14.3](https://github.com/algolia/instantsearch.js/compare/v0.14.2...v0.14.3) (2015-11-17)


### Bug Fixes

* **examples:** media logo ([64f850e](https://github.com/algolia/instantsearch.js/commit/64f850e))
* **website:** demos link to https ([b69c0f5](https://github.com/algolia/instantsearch.js/commit/b69c0f5))



<a name="0.14.2"></a>
## [0.14.2](https://github.com/algolia/instantsearch.js/compare/v0.14.1...v0.14.2) (2015-11-17)


### Bug Fixes

* **numericSelector:** pass currentValue as the refined value, not the full obj ([9286b4b](https://github.com/algolia/instantsearch.js/commit/9286b4b))
* **website:** search icon ([623f071](https://github.com/algolia/instantsearch.js/commit/623f071))



<a name="0.14.1"></a>
## [0.14.1](https://github.com/algolia/instantsearch.js/compare/v0.14.0...v0.14.1) (2015-11-16)


### Bug Fixes

* **docs:** minor CSS fixes ([94fa868](https://github.com/algolia/instantsearch.js/commit/94fa868)), closes [#573](https://github.com/algolia/instantsearch.js/issues/573)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/algolia/instantsearch.js/compare/v0.13.0...v0.14.0) (2015-11-13)


### Bug Fixes

* **hierarchicalMenu:** handle limit option ([968cf58](https://github.com/algolia/instantsearch.js/commit/968cf58)), closes [#585](https://github.com/algolia/instantsearch.js/issues/585) [#235](https://github.com/algolia/instantsearch.js/issues/235)
* **numeric-selector:** makes init comply with the new API ([068e8d3](https://github.com/algolia/instantsearch.js/commit/068e8d3))

### Features

* **core:** sends a custom User Agent ([2561154](https://github.com/algolia/instantsearch.js/commit/2561154))
* **lifecycle:** makes init API consistent with the rest ([e7ed81f](https://github.com/algolia/instantsearch.js/commit/e7ed81f))

### BREAKING CHANGES

* all widgets using "facetName" are now using "attributeName"

<a name="0.13.0"></a>
# [0.13.0](https://github.com/algolia/instantsearch.js/compare/v0.12.3...v0.13.0) (2015-11-12)


### Features

* **clearAll:** New widget ([9e61a14](https://github.com/algolia/instantsearch.js/commit/9e61a14))



<a name="0.12.3"></a>
## [0.12.3](https://github.com/algolia/instantsearch.js/compare/v0.12.2...v0.12.3) (2015-11-12)




<a name="0.12.2"></a>
## [0.12.2](https://github.com/algolia/instantsearch.js/compare/v0.12.1...v0.12.2) (2015-11-12)


### Bug Fixes

* **layout:** missing div (did we lost that fix?) ([9a515e4](https://github.com/algolia/instantsearch.js/commit/9a515e4))



<a name="0.12.1"></a>
## [0.12.1](https://github.com/algolia/instantsearch.js/compare/v0.12.0...v0.12.1) (2015-11-12)


### Bug Fixes

* **counts:** missing formatNumber calls ([65e5ba0](https://github.com/algolia/instantsearch.js/commit/65e5ba0)), closes [#560](https://github.com/algolia/instantsearch.js/issues/560)
* **doc:** ensure selector is not conflicting ([6528f2c](https://github.com/algolia/instantsearch.js/commit/6528f2c)), closes [#505](https://github.com/algolia/instantsearch.js/issues/505)
* **docs:** improved label/input hover debug ([58573db](https://github.com/algolia/instantsearch.js/commit/58573db)), closes [#503](https://github.com/algolia/instantsearch.js/issues/503)
* **examples/airbnb:** Use default theme from CDN ([f379c0a](https://github.com/algolia/instantsearch.js/commit/f379c0a)), closes [#522](https://github.com/algolia/instantsearch.js/issues/522)
* **examples/youtube:** use the default theme ([cf9a4b6](https://github.com/algolia/instantsearch.js/commit/cf9a4b6))
* **rangeSlider:** fixed tooltip CSS & outdated default theme. ([c4be2ef](https://github.com/algolia/instantsearch.js/commit/c4be2ef))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/algolia/instantsearch.js/compare/v0.11.1...v0.12.0) (2015-11-10)


### Bug Fixes

* **pagination:** Fix double BEM classes on elements ([2ede317](https://github.com/algolia/instantsearch.js/commit/2ede317)), closes [#500](https://github.com/algolia/instantsearch.js/issues/500)
* **price-ranges:** fix usage + add test ([89601d7](https://github.com/algolia/instantsearch.js/commit/89601d7))
* **range-slider:** check usage + display (fixes #395) ([301643a](https://github.com/algolia/instantsearch.js/commit/301643a)), closes [#395](https://github.com/algolia/instantsearch.js/issues/395)
* **rangeSlider:** error when no result ([70e8554](https://github.com/algolia/instantsearch.js/commit/70e8554))
* **theme:** Revert default spacing into pagination ([d755fd5](https://github.com/algolia/instantsearch.js/commit/d755fd5))


### BREAKING CHANGES

* pagination: Removes all `__disabled`, `__first`, `__last`,
`__next`, `__previous`, `__active` and `__page` classes added on the links in the
pagination. It only ads them to the parent `li`. Links instead now
have a `.ais-pagination--link` class

Previously, the same CSS classes where added to both the `item` (`li`) and the
link inside it. I've split them in `--item` and `--link`.

I've also made the various active/first/disabled/etc modifiers as
actual `__modifier` classes.

I've updated the tests, the CSS skeleton, the examples and the docs
accordingly.



<a name="0.11.1"></a>
## [0.11.1](https://github.com/algolia/instantsearch.js/compare/v0.11.0...v0.11.1) (2015-11-10)




<a name="0.11.0"></a>
# [0.11.0](https://github.com/algolia/instantsearch.js/compare/v0.10.0...v0.11.0) (2015-11-06)

### Bug Fixes

* **bem:** Make scss mixins actually follow BEM ([fcfb408](https://github.com/algolia/instantsearch.js/commit/fcfb408))
* **doc:** bolder font for the navigation ([64f6d56](https://github.com/algolia/instantsearch.js/commit/64f6d56))
* **InstantSearch:** throw error when init and render are not defined. Fixes #499 ([2830cd3](https://github.com/algolia/instantsearch.js/commit/2830cd3)), closes [#499](https://github.com/algolia/instantsearch.js/issues/499)
* **live-doc:** adds a start at a responsive display ([c83967e](https://github.com/algolia/instantsearch.js/commit/c83967e))
* **live-doc:** adds navigation menu for smaller screens ([a6bb71e](https://github.com/algolia/instantsearch.js/commit/a6bb71e))
* **live-doc:** fixes flow for texts ([3855071](https://github.com/algolia/instantsearch.js/commit/3855071))
* **live-doc:** Momentum scroll for iPhone ([60a36ff](https://github.com/algolia/instantsearch.js/commit/60a36ff))
* **live-doc:** uses only h4 and fixes style of h4 (mobile) ([0fdd2d0](https://github.com/algolia/instantsearch.js/commit/0fdd2d0))
* **middle-click:** Allow middle click on links ([a7601c0](https://github.com/algolia/instantsearch.js/commit/a7601c0))
* **range-slider:** Use lodash find instead of Array.prototype.find ([056153c](https://github.com/algolia/instantsearch.js/commit/056153c))
* **searchBox:** handling pasting event with contextual menu. ([a172458](https://github.com/algolia/instantsearch.js/commit/a172458)), closes [#467](https://github.com/algolia/instantsearch.js/issues/467)
* **website:** defered doc scripts ([0c1324f](https://github.com/algolia/instantsearch.js/commit/0c1324f))
* **website:** doc layout responsive ([a4dc894](https://github.com/algolia/instantsearch.js/commit/a4dc894))
* **website:** fixed space overlay color animation ([200b8a7](https://github.com/algolia/instantsearch.js/commit/200b8a7))
* **website:** Fixes & responsive stuff for doc ([7a8f920](https://github.com/algolia/instantsearch.js/commit/7a8f920))
* **website:** footer markup ([95364a1](https://github.com/algolia/instantsearch.js/commit/95364a1))
* **website:** home.js lint ([b70e06e](https://github.com/algolia/instantsearch.js/commit/b70e06e))
* **website:** icon-theme didn't like svgo (to fix) ([38d84af](https://github.com/algolia/instantsearch.js/commit/38d84af))
* **website:** image alt ([30cca29](https://github.com/algolia/instantsearch.js/commit/30cca29))
* **website:** jsdelivr for every scripts ([06591d4](https://github.com/algolia/instantsearch.js/commit/06591d4))
* **website:** Nav Icon + logo ([c1f419c](https://github.com/algolia/instantsearch.js/commit/c1f419c))
* **website:** only load what's needed in bootstrap ([4843474](https://github.com/algolia/instantsearch.js/commit/4843474))
* **website:** removed animation debug ([01ac079](https://github.com/algolia/instantsearch.js/commit/01ac079))
* **website:** space bg fadeIn ([5e09844](https://github.com/algolia/instantsearch.js/commit/5e09844))
* **website:** unclosed content block ([d42dc3e](https://github.com/algolia/instantsearch.js/commit/d42dc3e))

### Features

* **hierarchicalMenu:** Adding indentation with default theme ([34885d2](https://github.com/algolia/instantsearch.js/commit/34885d2))


### BREAKING CHANGES

* hierarchicalMenu: Hierarchical menu levels 1 and 2 now have
a margin-left added in the default theme.


<a name="0.10.0"></a>
# [0.10.0](https://github.com/algolia/instantsearch.js/compare/v0.9.0...v0.10.0) (2015-11-06)


### Bug Fixes

* **api:** rename hideContainerWhenNoResults to autoHideContainer ([3f64bef](https://github.com/algolia/instantsearch.js/commit/3f64bef)), closes [#407](https://github.com/algolia/instantsearch.js/issues/407)
* **doc:** ensure the documentation content doesn't overflow ([1e28a4e](https://github.com/algolia/instantsearch.js/commit/1e28a4e)), closes [#444](https://github.com/algolia/instantsearch.js/issues/444)
* **hitsPerPageSelector:** Be more tolerant in options ([e14a344](https://github.com/algolia/instantsearch.js/commit/e14a344))
* **numeric widgets:** synchronizes rounded value between widgets ([b314160](https://github.com/algolia/instantsearch.js/commit/b314160))
* **numeric-refinement:** Replace Array.find with lodash find/includes ([b3e815c](https://github.com/algolia/instantsearch.js/commit/b3e815c))
* **price-ranges:** makes it uses same operator as the slider ([ad6f5c2](https://github.com/algolia/instantsearch.js/commit/ad6f5c2))
* **range-slider:** fixes bound definition ([e15c9b7](https://github.com/algolia/instantsearch.js/commit/e15c9b7))
* **selector:** makes component as uncontrolled component ([1dda12a](https://github.com/algolia/instantsearch.js/commit/1dda12a))
* **slider:** fixed `pip` propTypes constraint ([c77b7f4](https://github.com/algolia/instantsearch.js/commit/c77b7f4))
* **website:** fix images path ([a3f62eb](https://github.com/algolia/instantsearch.js/commit/a3f62eb))

### Features

* **searchBox:** ability to be non-instant ([b3ef871](https://github.com/algolia/instantsearch.js/commit/b3ef871)), closes [#458](https://github.com/algolia/instantsearch.js/issues/458)
* **toggle:** Allow custom on/off values ([9b6c2bf](https://github.com/algolia/instantsearch.js/commit/9b6c2bf)), closes [#409](https://github.com/algolia/instantsearch.js/issues/409)

### Performance Improvements

* **hitsPerPageSelector:** Use the correct lodash function ([be9aea7](https://github.com/algolia/instantsearch.js/commit/be9aea7))


### BREAKING CHANGES

* api: use autoHideContainer instead of
hideContainerWhenNoResults



<a name="0.9.0"></a>
# [0.9.0](https://github.com/algolia/instantsearch.js/compare/v0.8.2...v0.9.0) (2015-11-04)


### Features

* **numericRefinementList:** create numericRefinementList widget using refinementList component ([a29e9c7](https://github.com/algolia/instantsearch.js/commit/a29e9c7))



<a name="0.8.2"></a>
## [0.8.2](https://github.com/algolia/instantsearch.js/compare/v0.8.1...v0.8.2) (2015-11-04)


### Bug Fixes

* **doc:** All wigdets in docs are not anymore linked together #fix #446 ([4361320](https://github.com/algolia/instantsearch.js/commit/4361320)), closes [#446](https://github.com/algolia/instantsearch.js/issues/446)
* **hitsPerPageSelector:** Issue when state did not have a `hitsPerPage` ([dc9371c](https://github.com/algolia/instantsearch.js/commit/dc9371c))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/algolia/instantsearch.js/compare/v0.8.0...v0.8.1) (2015-11-04)


### Bug Fixes

* **hierarchicalMenu:** handle cases where no results after a search ([0a1d0ac](https://github.com/algolia/instantsearch.js/commit/0a1d0ac)), closes [#385](https://github.com/algolia/instantsearch.js/issues/385)

### Features

* **build:** allow building React based custom widgets ([cfbbfe4](https://github.com/algolia/instantsearch.js/commit/cfbbfe4)), closes [#373](https://github.com/algolia/instantsearch.js/issues/373)



<a name="0.8.0"></a>
# [0.8.0](https://github.com/algolia/instantsearch.js/compare/v0.7.0...v0.8.0) (2015-11-03)


### Bug Fixes

* **cssClasses:** Fixed duplication of classNames ([e193f45](https://github.com/algolia/instantsearch.js/commit/e193f45)), closes [#388](https://github.com/algolia/instantsearch.js/issues/388)
* **doc:** add doctype were missing ([86a18aa](https://github.com/algolia/instantsearch.js/commit/86a18aa))
* **doc:** new color scheme ([deccc17](https://github.com/algolia/instantsearch.js/commit/deccc17))
* **doc:** only show a scrollbar when needed ([f2d955b](https://github.com/algolia/instantsearch.js/commit/f2d955b))
* **hierarchical:** setPage 0 when toggling ([a976539](https://github.com/algolia/instantsearch.js/commit/a976539)), closes [#371](https://github.com/algolia/instantsearch.js/issues/371)
* **jsdoc:** use babel-node ([453dc21](https://github.com/algolia/instantsearch.js/commit/453dc21))
* **live-doc:** generates missing ul ([b43e6e2](https://github.com/algolia/instantsearch.js/commit/b43e6e2))
* **live-doc:** move scrollbars, removes useless ones ([548ae5f](https://github.com/algolia/instantsearch.js/commit/548ae5f))
* **live-doc:** moves octocat link to top. Removes stackOverflow ([8ff6a79](https://github.com/algolia/instantsearch.js/commit/8ff6a79))
* **live-doc:** Moves version in the main content ([27731c3](https://github.com/algolia/instantsearch.js/commit/27731c3))
* **live-reload:** integrates the links into the menu flow ([c118051](https://github.com/algolia/instantsearch.js/commit/c118051))
* **numerical widgets:** s/facetName/attributeName ([f209f5d](https://github.com/algolia/instantsearch.js/commit/f209f5d)), closes [#431](https://github.com/algolia/instantsearch.js/issues/431)
* **refinementList:** ensure the key reflects the underlying state ([b048f0b](https://github.com/algolia/instantsearch.js/commit/b048f0b)), closes [#398](https://github.com/algolia/instantsearch.js/issues/398)

### Features

* **examples:** try examples instead of themes ([bedffce](https://github.com/algolia/instantsearch.js/commit/bedffce))
* **headerFooter:** Only add markup if a template is defined ([7a2d22d](https://github.com/algolia/instantsearch.js/commit/7a2d22d)), closes [#370](https://github.com/algolia/instantsearch.js/issues/370)
* **priceRanges:** Add BEM classes and tests ([ad58d7a](https://github.com/algolia/instantsearch.js/commit/ad58d7a)), closes [#387](https://github.com/algolia/instantsearch.js/issues/387)


### BREAKING CHANGES

* numerical widgets: the priceRanges and rangeSlider widgets are now using `attributeName` instead of `facetName`.
* priceRanges: `ais-price-ranges--range` are now named
`ais-price-ranges--item` and are wrapped in
a `ais-price-ranges--list`.

I've moved the bottom form into it's own PriceRangesForm component,
along with its own tests. I've fixed a minor typo where the component
was internally named PriceRange (without the final __s__).

I factorize some logic form the render in individual methods and
manage to individually test them. This was not an easy task. I had to
mock the default `render` (so it does nothing) before instantiating
the component. Then, I was able to call each inner method
individually. This requires to stub prototype methods in beforeEach,
then restore them in afterEach. I've added a few helper methods, this
can surely be simplified again but this gives nice granularity in
testing.

I've renamed the `range` items to `item` and wrapped them in a `list`.
I've also added classes to all elements we add (`label`, `separator`,
etc). I've removed the empty `span`s.
* headerFooter: The `<div class="ais-header">` and `<div
class="ais-footer">` markup is only added when
a `templates.{header,footer}` is passed.



<a name="0.7.0"></a>
# [0.7.0](https://github.com/algolia/instantsearch.js/compare/v0.6.5...v0.7.0) (2015-10-28)


### Features

* **searchBox:** Add `wrapInput` option ([b327dbc](https://github.com/algolia/instantsearch.js/commit/b327dbc))
* **urls:** ability to create an URL from a set of params ([9ca8369](https://github.com/algolia/instantsearch.js/commit/9ca8369)), closes [#372](https://github.com/algolia/instantsearch.js/issues/372)


### BREAKING CHANGES

* urls: the instantsearch.createURL method is now taking a
simple JS object and not a SearchParameter instance anymore.
* searchBox: The `input` used by the search-box widget is now
wrapped in a `<div class="ais-search-box">` by default. This can be
turned off with `wrapInput: false`.

This PR is a bit long, I had to do some minor refactoring to keep the
new code understandable. I simply split the large `init` method into
calls to smaller methods.

There is some vanilla JS DOM manipulation involved to handle all the
possible cases: targeting an `input` or a `div`, adding or not the
`poweredBy`, adding or not the wrapping div.

Note that there is no `targetNode.insertAfter(newNode)` method, so
I had to resort to the old trick of `parentNode.insertBefore(newNode,
targetNode.nextSibling)`.



<a name="0.6.5"></a>
## [0.6.5](https://github.com/algolia/instantsearch.js/compare/v0.6.4...v0.6.5) (2015-10-27)




<a name="0.6.4"></a>
## [0.6.4](https://github.com/algolia/instantsearch.js/compare/v0.6.3...v0.6.4) (2015-10-27)




<a name="0.6.3"></a>
## [0.6.3](https://github.com/algolia/instantsearch.js/compare/v0.6.2...v0.6.3) (2015-10-27)




<a name="0.6.2"></a>
## [0.6.2](https://github.com/algolia/instantsearch.js/compare/v0.6.1...v0.6.2) (2015-10-27)




<a name="0.6.1"></a>
## [0.6.1](https://github.com/algolia/instantsearch.js/compare/v0.6.0...v0.6.1) (2015-10-27)




<a name="0.6.0"></a>
# [0.6.0](https://github.com/algolia/instantsearch.js/compare/v0.5.1...v0.6.0) (2015-10-27)


### Bug Fixes

* **generateRanges:** avoid any infinite loop. Fix #351 ([4965222](https://github.com/algolia/instantsearch.js/commit/4965222)), closes [#351](https://github.com/algolia/instantsearch.js/issues/351)
* **index-selector:** Fix tests passing with incorrect parameters ([8fc31b9](https://github.com/algolia/instantsearch.js/commit/8fc31b9))
* **index-selector:** Update usage and error ([a7e4c10](https://github.com/algolia/instantsearch.js/commit/a7e4c10))
* **priceRanges:** fixed 'active' CSS class not using BEM ([ec0d1b1](https://github.com/algolia/instantsearch.js/commit/ec0d1b1))
* **priceRanges:** plug the URL computation. Fix #354 ([fbf4022](https://github.com/algolia/instantsearch.js/commit/fbf4022)), closes [#354](https://github.com/algolia/instantsearch.js/issues/354)
* **template:** transformData checks too strict ([609f123](https://github.com/algolia/instantsearch.js/commit/609f123)), closes [#347](https://github.com/algolia/instantsearch.js/issues/347)

### Features

* **hits-per-page-selector:** New widget to change hitsPerPage ([a3e0f78](https://github.com/algolia/instantsearch.js/commit/a3e0f78)), closes [#331](https://github.com/algolia/instantsearch.js/issues/331)


### BREAKING CHANGES

* priceRanges: the `input-group` modifier has been renamed to `form`



<a name="0.5.1"></a>
## [0.5.1](https://github.com/algolia/instantsearch.js/compare/v0.5.0...v0.5.1) (2015-10-22)


### Bug Fixes

* **autohide:** Rename attribute to `hideContainerWhenNoResults` ([ecb6756](https://github.com/algolia/instantsearch.js/commit/ecb6756)), closes [#325](https://github.com/algolia/instantsearch.js/issues/325)


### BREAKING CHANGES

* autohide: Widget attribute is now named
`hideContainerWhenNoResults` instead of `hideWhenNoResults` to be more
explicit on what it is really doing.

Also internally renamed the `autoHide` decorator to
`autoHideContainer`



<a name="0.5.0"></a>
# [0.5.0](https://github.com/algolia/instantsearch.js/compare/v0.4.1...v0.5.0) (2015-10-22)


### Bug Fixes

* **example:** Example searchbox ([cdad6c7](https://github.com/algolia/instantsearch.js/commit/cdad6c7)), closes [#157](https://github.com/algolia/instantsearch.js/issues/157)
* **hierarchicalFacets:** use a real attribute name for the hierarchicalFacet name ([0d2a455](https://github.com/algolia/instantsearch.js/commit/0d2a455))
* **hits:** Fix warning about unique key in iterator ([0c9468c](https://github.com/algolia/instantsearch.js/commit/0c9468c))
* **onClick:** do not replace the browser's behavior on special clicks ([8562d49](https://github.com/algolia/instantsearch.js/commit/8562d49)), closes [#278](https://github.com/algolia/instantsearch.js/issues/278)
* **package.json:** typo in repository ([33cf196](https://github.com/algolia/instantsearch.js/commit/33cf196))
* **pagination:** do not generate the URL for disabled pages. ([e5d78ab](https://github.com/algolia/instantsearch.js/commit/e5d78ab)), closes [#282](https://github.com/algolia/instantsearch.js/issues/282)
* **poweredBy:** Extract its hiding capabilities ([f5fa9ee](https://github.com/algolia/instantsearch.js/commit/f5fa9ee)), closes [#189](https://github.com/algolia/instantsearch.js/issues/189)
* **rangeSlider:** refinements cleanuo ([16c132c](https://github.com/algolia/instantsearch.js/commit/16c132c)), closes [#147](https://github.com/algolia/instantsearch.js/issues/147)
* **rangeSlider:** restore wrongly removed state nesting ([3ed3d39](https://github.com/algolia/instantsearch.js/commit/3ed3d39))
* **React:** require React in order for JSX to work in widgets ([64d6011](https://github.com/algolia/instantsearch.js/commit/64d6011))
* **react-nouislider:** upgrade react-nouislider to avoid mutating props ([1b7cd1d](https://github.com/algolia/instantsearch.js/commit/1b7cd1d))
* **refinementList:** Remove `singleRefine` attribute ([db73e38](https://github.com/algolia/instantsearch.js/commit/db73e38)), closes [#220](https://github.com/algolia/instantsearch.js/issues/220)
* **refinementList:** singleRefine is not dependant from operator ([d29dff6](https://github.com/algolia/instantsearch.js/commit/d29dff6))
* **RefinementList:** click on child should not click on parent ([d476da2](https://github.com/algolia/instantsearch.js/commit/d476da2)), closes [#191](https://github.com/algolia/instantsearch.js/issues/191)
* **Slider:** cssClasses.body handled by headerFooter HOC ([d8d20b2](https://github.com/algolia/instantsearch.js/commit/d8d20b2))
* **stats:** Move CSS classes definition to widget from component ([99073cd](https://github.com/algolia/instantsearch.js/commit/99073cd))
* **transformData:** add an explicit error message ([94c53d3](https://github.com/algolia/instantsearch.js/commit/94c53d3)), closes [#212](https://github.com/algolia/instantsearch.js/issues/212)
* **transformData:** this test is not needed, already covered by Template ([36e5b9c](https://github.com/algolia/instantsearch.js/commit/36e5b9c))
* **validate-commit:** Update the regexp ([96b93ba](https://github.com/algolia/instantsearch.js/commit/96b93ba))

### Features

* **bem:** Add BEM to the index-selector widget ([564da51](https://github.com/algolia/instantsearch.js/commit/564da51))
* **bem:** Add BEM-styling to the Stats widget ([92cebeb](https://github.com/algolia/instantsearch.js/commit/92cebeb))
* **build:** Add minified CSS theme version to build ([77f0640](https://github.com/algolia/instantsearch.js/commit/77f0640))
* **core/lifecycle-event:** emits `render` when render ([7f03ae9](https://github.com/algolia/instantsearch.js/commit/7f03ae9))
* **es7:** Enable `es7.objectRestSpread` ([fc2fbc4](https://github.com/algolia/instantsearch.js/commit/fc2fbc4))
* **headerFooter:** Add BEM classes to header and footer ([9e9d438](https://github.com/algolia/instantsearch.js/commit/9e9d438)), closes [#259](https://github.com/algolia/instantsearch.js/issues/259)
* **hierarchical-menu:** Add BEM classes ([58ec191](https://github.com/algolia/instantsearch.js/commit/58ec191))
* **hierarchical-menu:** Add CSS classes dependent on the depth ([1256ea8](https://github.com/algolia/instantsearch.js/commit/1256ea8))
* **hits:** Add BEM styling to the `hits` widget ([6681960](https://github.com/algolia/instantsearch.js/commit/6681960))
* **menu:** Add BEM classes ([467f49e](https://github.com/algolia/instantsearch.js/commit/467f49e))
* **pagination:** add `scrollTo` option ([e6cd621](https://github.com/algolia/instantsearch.js/commit/e6cd621)), closes [#73](https://github.com/algolia/instantsearch.js/issues/73)
* **priceRanges:** new Amazon-style price ranges widget ([e5fe344](https://github.com/algolia/instantsearch.js/commit/e5fe344))
* **priceRanges:** polish priceRanges widget ([0994e6f](https://github.com/algolia/instantsearch.js/commit/0994e6f))
* **refinement-list:** Add BEM naming ([b09b830](https://github.com/algolia/instantsearch.js/commit/b09b830))
* **refinementlist:** Move default templates to its own file ([cb6fa16](https://github.com/algolia/instantsearch.js/commit/cb6fa16))
* **refinementList:** Limits improvement ([ebcc8a9](https://github.com/algolia/instantsearch.js/commit/ebcc8a9))
* **searchbox:** Make the searchBox BEMish ([db8bd60](https://github.com/algolia/instantsearch.js/commit/db8bd60))
* **theme:** Add `searchBox` widget to default theme ([def831f](https://github.com/algolia/instantsearch.js/commit/def831f))
* **theme:** Add debug.css file ([ff8f2dc](https://github.com/algolia/instantsearch.js/commit/ff8f2dc)), closes [#249](https://github.com/algolia/instantsearch.js/issues/249)
* **theme:** Move `indexSelector` styling to default.css ([1841ef1](https://github.com/algolia/instantsearch.js/commit/1841ef1))
* **theme:** Move all default css rules to `default.css` ([57c8c65](https://github.com/algolia/instantsearch.js/commit/57c8c65))
* **toggle:** Adding BEM class naming ([8730c97](https://github.com/algolia/instantsearch.js/commit/8730c97))
* **urlSync:** url generation for widget links. Fix #29 ([23dd505](https://github.com/algolia/instantsearch.js/commit/23dd505)), closes [#29](https://github.com/algolia/instantsearch.js/issues/29)


### BREAKING CHANGES

* build: You should now include the `default.css` file in your
page to get the default styling.

- Added `clean-css` as minifier
- Updated build script
- Updated documentation about loading it from jsdeliver
- `npm shrinkwrap` madness
* hits: The hit template and transform data key is renamed
from `hit` to `item` to stay consistent with the other widgets
* menu: The default template now has the count element inside
the link, not outside.
* stats: `cssClasses.root` now applies to the main root
element (above header and footer) and no longer to the template
wrapper. To style the template wrapper, use `cssClasses.body`
* theme: Classes are now named `ais-index-selector` and
`ais-index-selector--item` to stay consistent with other widgets.

Updated tests as well. Widget is responsible for adding default
classes + user-defined ones. Then component simply add them to the
markup.
* theme: "Powered by" styles are now
`ais-search-box--powered-by` and `ais-search-box--powered-by-link`.
* urlSync: urlSync is not a widget anymore. It's now an option of
instantsearch(appID, apiKey, opts);. See the README.md for more info.
* searchbox: The `searchBox` widget now expect
a `cssClasses.{input, poweredBy}`
* bem: We now use a `span.ais-stats--time` instead of
a `small` tag in the stats widget.
* bem: We now use `cssClasses.select` and
`cssClasses.option` instead of `cssClass` for the index-selector
widget.



<a name="0.4.1"></a>
## [0.4.1](https://github.com/algolia/instantsearch.js/compare/v0.4.0...v0.4.1) (2015-10-05)


### Bug Fixes

* allow passing only one key of transformData as an object ([e0ce89f](https://github.com/algolia/instantsearch.js/commit/e0ce89f))
* **search-box:** Fix #137 autofocus must be configurable ([51f01be](https://github.com/algolia/instantsearch.js/commit/51f01be)), closes [#137](https://github.com/algolia/instantsearch.js/issues/137)
* **searchBox:** do not update input's value if focused ([0e85f0d](https://github.com/algolia/instantsearch.js/commit/0e85f0d)), closes [#163](https://github.com/algolia/instantsearch.js/issues/163)
* **templatesConfig:** helpers are now following Mustache spec ([8f3502f](https://github.com/algolia/instantsearch.js/commit/8f3502f))
* **url-sync:** handle both hash and query parameter fix #165 ([8d84de6](https://github.com/algolia/instantsearch.js/commit/8d84de6)), closes [#165](https://github.com/algolia/instantsearch.js/issues/165)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/algolia/instantsearch.js/compare/v0.3.0...v0.4.0) (2015-09-30)


### Bug Fixes

* **pagination:** handle cases where maxPages is low ([d3c9959](https://github.com/algolia/instantsearch.js/commit/d3c9959)), closes [#100](https://github.com/algolia/instantsearch.js/issues/100)
* **searchBox:** allow searchBox to reuse an `<input>` ([e820cc3](https://github.com/algolia/instantsearch.js/commit/e820cc3))
* **searchBox:** Use `hasAttribute` instead of `getAttribute` ([a122af9](https://github.com/algolia/instantsearch.js/commit/a122af9))
* **slider:** allow handles to reach the real start and end of the slider ([03ed3f5](https://github.com/algolia/instantsearch.js/commit/03ed3f5))
* **slider:** fix tap event throwing ([d906d3e](https://github.com/algolia/instantsearch.js/commit/d906d3e)), closes [#120](https://github.com/algolia/instantsearch.js/issues/120)
* **Template:** add default value for template ([4291014](https://github.com/algolia/instantsearch.js/commit/4291014))
* **url-sync:** make input not to lose focus ([63488d3](https://github.com/algolia/instantsearch.js/commit/63488d3))

### Features

* **rangeSlider:** add headerFooter decorator ([19090c3](https://github.com/algolia/instantsearch.js/commit/19090c3))
* **searchBox:** add headerFooter decorator to the Component ([5974a88](https://github.com/algolia/instantsearch.js/commit/5974a88))
* **templatesConfig:** helpers and options transferred to Template ([456d781](https://github.com/algolia/instantsearch.js/commit/456d781)), closes [#99](https://github.com/algolia/instantsearch.js/issues/99)
* **toggle:** add headerFooter decorator ([8a70c7d](https://github.com/algolia/instantsearch.js/commit/8a70c7d))
* **url-sync:** Add `is_v` version to url ([9f597a0](https://github.com/algolia/instantsearch.js/commit/9f597a0)), closes [#70](https://github.com/algolia/instantsearch.js/issues/70)
* hierarchicalWidget ([1facd9d](https://github.com/algolia/instantsearch.js/commit/1facd9d))


### BREAKING CHANGES

* S:
- toggle: removed template
* - removed: inputClass



<a name="0.3.0"></a>
# [0.3.0](https://github.com/algolia/instantsearch.js/compare/v0.2.2...v0.3.0) (2015-09-24)


### Bug Fixes

* Allow not specifying `cssClass` on index selector ([4e9324f](https://github.com/algolia/instantsearch.js/commit/4e9324f))
* More explicit error message when DOM selector is invalid ([d36a2ad](https://github.com/algolia/instantsearch.js/commit/d36a2ad)), closes [#105](https://github.com/algolia/instantsearch.js/issues/105)
* Pass nbHits, hitsPerPage, nbPages and page to Stats widget ([deefd23](https://github.com/algolia/instantsearch.js/commit/deefd23)), closes [#106](https://github.com/algolia/instantsearch.js/issues/106)
* **hideIfEmpty:** should be hideWhenNoResults ([21877a0](https://github.com/algolia/instantsearch.js/commit/21877a0))
* **Hits:** handle the display when there is no result ([544ff5c](https://github.com/algolia/instantsearch.js/commit/544ff5c))
* **menu:** send an empty array values when no values ([12cd7dc](https://github.com/algolia/instantsearch.js/commit/12cd7dc)), closes [#107](https://github.com/algolia/instantsearch.js/issues/107)
* **pagination:** missing showFirstLast attribute when instantiating ([28fa0ae](https://github.com/algolia/instantsearch.js/commit/28fa0ae))
* **SearchBox:** Missing poweredBy in the not focused SearchBox ([ef695ff](https://github.com/algolia/instantsearch.js/commit/ef695ff))
* **slider:** hide slider if when no hits/matches ([31e4a80](https://github.com/algolia/instantsearch.js/commit/31e4a80)), closes [#107](https://github.com/algolia/instantsearch.js/issues/107)

### Features

* **menu,refinementList:** add header/item/footer templating solution ([58275dc](https://github.com/algolia/instantsearch.js/commit/58275dc)), closes [#101](https://github.com/algolia/instantsearch.js/issues/101)
* **searchBox:** add poweredBy option, disabled by default ([c9da165](https://github.com/algolia/instantsearch.js/commit/c9da165))
* **stats:** add query variable to the template ([75f457d](https://github.com/algolia/instantsearch.js/commit/75f457d))
* **transformData:** add to every widget using the Template component ([d080a03](https://github.com/algolia/instantsearch.js/commit/d080a03)), closes [#116](https://github.com/algolia/instantsearch.js/issues/116)
* **transformData:** refinementList + menu implementation ([0a0e36e](https://github.com/algolia/instantsearch.js/commit/0a0e36e))
* **urlSync:** add urlSync widget ([50fc4ce](https://github.com/algolia/instantsearch.js/commit/50fc4ce))
* **widgets:** auto hide some widgets ([187b4bd](https://github.com/algolia/instantsearch.js/commit/187b4bd))


### BREAKING CHANGES

* Removed from menu and refinementList:
- rootClass => cssClasses.root
- itemCLass => cssClasses.item
- template => templates.item

Added to menu and refinementList:
- cssClasses{root,list,item}
- templates{header,item,footer}
- widget (container) is automatically hidden by default
- hideWhenNoResults=true

This was done to allow more templating solutions like discussed in #101.



<a name="0.2.2"></a>
## [0.2.2](https://github.com/algolia/instantsearch.js/compare/v0.1.0...v0.2.2) (2015-09-17)




<a name="0.2.1"></a>
## [0.2.1](https://github.com/algolia/instantsearch.js/compare/v0.1.0...v0.2.1) (2015-09-17)




<a name="0.1.0"></a>
# 0.1.0 (2015-09-17)

First release

<a name="0.0.0"></a>
## [0.0.0](https://github.com/algolia/instantsearch.js/compare/v0.0.0...v0.0.0) (2015-09-17)

First commit
