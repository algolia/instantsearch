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
* **pagination:** missing showFirstLast attribute when instanciating ([28fa0ae](https://github.com/algolia/instantsearch.js/commit/28fa0ae))
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
