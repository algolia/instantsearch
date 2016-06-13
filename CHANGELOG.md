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
