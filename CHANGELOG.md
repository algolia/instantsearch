<a name="0.3.0"></a>
# [0.3.0](https://github.com/algolia/intantsearch.js/compare/v0.2.2...v0.3.0) (2015-09-24)


### Bug Fixes

* Allow not specifying `cssClass` on index selector ([4e9324f](https://github.com/algolia/intantsearch.js/commit/4e9324f))
* More explicit error message when DOM selector is invalid ([d36a2ad](https://github.com/algolia/intantsearch.js/commit/d36a2ad)), closes [#105](https://github.com/algolia/intantsearch.js/issues/105)
* Pass nbHits, hitsPerPage, nbPages and page to Stats widget ([deefd23](https://github.com/algolia/intantsearch.js/commit/deefd23)), closes [#106](https://github.com/algolia/intantsearch.js/issues/106)
* **hideIfEmpty:** should be hideWhenNoResults ([21877a0](https://github.com/algolia/intantsearch.js/commit/21877a0))
* **Hits:** handle the display when there is no result ([544ff5c](https://github.com/algolia/intantsearch.js/commit/544ff5c))
* **menu:** send an empty array values when no values ([12cd7dc](https://github.com/algolia/intantsearch.js/commit/12cd7dc)), closes [#107](https://github.com/algolia/intantsearch.js/issues/107)
* **pagination:** missing showFirstLast attribute when instanciating ([28fa0ae](https://github.com/algolia/intantsearch.js/commit/28fa0ae))
* **SearchBox:** Missing poweredBy in the not focused SearchBox ([ef695ff](https://github.com/algolia/intantsearch.js/commit/ef695ff))
* **slider:** hide slider if when no hits/matches ([31e4a80](https://github.com/algolia/intantsearch.js/commit/31e4a80)), closes [#107](https://github.com/algolia/intantsearch.js/issues/107)

### Features

* **menu,refinementList:** add header/item/footer templating solution ([58275dc](https://github.com/algolia/intantsearch.js/commit/58275dc)), closes [#101](https://github.com/algolia/intantsearch.js/issues/101)
* **searchBox:** add poweredBy option, disabled by default ([c9da165](https://github.com/algolia/intantsearch.js/commit/c9da165))
* **stats:** add query variable to the template ([75f457d](https://github.com/algolia/intantsearch.js/commit/75f457d))
* **transformData:** add to every widget using the Template component ([d080a03](https://github.com/algolia/intantsearch.js/commit/d080a03)), closes [#116](https://github.com/algolia/intantsearch.js/issues/116)
* **transformData:** refinementList + menu implementation ([0a0e36e](https://github.com/algolia/intantsearch.js/commit/0a0e36e))
* **urlSync:** add urlSync widget ([50fc4ce](https://github.com/algolia/intantsearch.js/commit/50fc4ce))
* **widgets:** auto hide some widgets ([187b4bd](https://github.com/algolia/intantsearch.js/commit/187b4bd))


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
## [0.2.2](https://github.com/algolia/intantsearch.js/compare/v0.1.0...v0.2.2) (2015-09-17)




<a name="0.2.1"></a>
## [0.2.1](https://github.com/algolia/intantsearch.js/compare/v0.1.0...v0.2.1) (2015-09-17)




<a name="0.1.0"></a>
# 0.1.0 (2015-09-17)

First release

<a name="0.0.0"></a>
## [0.0.0](https://github.com/algolia/intantsearch.js/compare/v0.0.0...v0.0.0) (2015-09-17)

First commit
