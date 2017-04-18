<a name="4.0.0-beta.2"></a>
# 4.0.0-beta.2 (2017-04-18)


### Bug Fixes

* add missing 'use strict's ([397294e](https://github.com/algolia/react-instantsearch/commit/397294e))
* add title for brands ([2e67c47](https://github.com/algolia/react-instantsearch/commit/2e67c47))
* allow adding css classes to the searchBox wrapper ([6ef0b0b](https://github.com/algolia/react-instantsearch/commit/6ef0b0b)), closes [#22](https://github.com/algolia/react-instantsearch/issues/22) [#24](https://github.com/algolia/react-instantsearch/issues/24)
* allow html in pagination labels ([4147358](https://github.com/algolia/react-instantsearch/commit/4147358)), closes [#36](https://github.com/algolia/react-instantsearch/issues/36)
* Allow not specifying `cssClass` on index selector ([4e9324f](https://github.com/algolia/react-instantsearch/commit/4e9324f))
* allow passing only one key of transformData as an object ([e0ce89f](https://github.com/algolia/react-instantsearch/commit/e0ce89f))
* Handle plural forms in template ([1bfd109](https://github.com/algolia/react-instantsearch/commit/1bfd109))
* **website:** search icon ([623f071](https://github.com/algolia/react-instantsearch/commit/623f071))
* cap the number of page displayed ([bc6c2e2](https://github.com/algolia/react-instantsearch/commit/bc6c2e2))
* change no results message ([80acf33](https://github.com/algolia/react-instantsearch/commit/80acf33))
* do not use memoize & co ([32c64e6](https://github.com/algolia/react-instantsearch/commit/32c64e6))
* expose main dist/ instead of index.js ([98bd889](https://github.com/algolia/react-instantsearch/commit/98bd889))
* Fix merge issues ([3b5e8f4](https://github.com/algolia/react-instantsearch/commit/3b5e8f4))
* fixed hits display height, no more scroll jumps ([6b4319d](https://github.com/algolia/react-instantsearch/commit/6b4319d))
* folder requires uses a trailing / to ease recognition of /index.js ([3ef55a3](https://github.com/algolia/react-instantsearch/commit/3ef55a3))
* Handle zero, one and many ([5434ca2](https://github.com/algolia/react-instantsearch/commit/5434ca2))
* hits widget should allow hitsPerPage configuration, pagination should not ([a2221a8](https://github.com/algolia/react-instantsearch/commit/a2221a8))
* instantSearch => instantsearch ([bdcbf18](https://github.com/algolia/react-instantsearch/commit/bdcbf18)), closes [#7](https://github.com/algolia/react-instantsearch/issues/7)
* ***List:** disable shortcuts in *List SearchBoxes (#1921) ([51a76ae](https://github.com/algolia/react-instantsearch/commit/51a76ae)), closes [#1920](https://github.com/algolia/react-instantsearch/issues/1920)
* **all:** typos ([fa8ba09](https://github.com/algolia/react-instantsearch/commit/fa8ba09))
* **api:** rename hideContainerWhenNoResults to autoHideContainer ([3f64bef](https://github.com/algolia/react-instantsearch/commit/3f64bef)), closes [#407](https://github.com/algolia/react-instantsearch/issues/407)
* **autohide:** Rename attribute to `hideContainerWhenNoResults` ([ecb6756](https://github.com/algolia/react-instantsearch/commit/ecb6756)), closes [#325](https://github.com/algolia/react-instantsearch/issues/325)
* **base href:** always create absolute URLS in widgets ([ae6dbf6](https://github.com/algolia/react-instantsearch/commit/ae6dbf6)), closes [#970](https://github.com/algolia/react-instantsearch/issues/970)
* **bem:** Make scss mixins actually follow BEM ([fcfb408](https://github.com/algolia/react-instantsearch/commit/fcfb408))
* **browser support:** make IE lte 10 work by fixing Object.getPrototypeOf ([bbb264b](https://github.com/algolia/react-instantsearch/commit/bbb264b))
* **build:** missing files + css style were not injected (#1515) ([a139225](https://github.com/algolia/react-instantsearch/commit/a139225))
* **build:** wrong file were copied (#1523) ([3711a08](https://github.com/algolia/react-instantsearch/commit/3711a08))
* **ci:** Testing Travis ([68177ea](https://github.com/algolia/react-instantsearch/commit/68177ea))
* **clear:** clearing wasn't working with too+ same type facets selected (#1820) ([a9a2364](https://github.com/algolia/react-instantsearch/commit/a9a2364))
* **ClearAll:** always display clearAll button, disabled when no filter (#1545) ([4588ecc](https://github.com/algolia/react-instantsearch/commit/4588ecc)), closes [#1530](https://github.com/algolia/react-instantsearch/issues/1530)
* **collapsible:** stop duplicating collapsible styling ([7362901](https://github.com/algolia/react-instantsearch/commit/7362901))
* **Configure:** add configure parameters in search state (#1935) ([0971330](https://github.com/algolia/react-instantsearch/commit/0971330)), closes [#1863](https://github.com/algolia/react-instantsearch/issues/1863)
* **Configure:** call onSearchStateChange when props are updated (#1953) ([7e151db](https://github.com/algolia/react-instantsearch/commit/7e151db)), closes [#1950](https://github.com/algolia/react-instantsearch/issues/1950)
* **Configure:** trigger onSearchStateChange with the right data ([11e5af8](https://github.com/algolia/react-instantsearch/commit/11e5af8))
* **Configure:** use props a unique source of truth (#1967) ([9d53d86](https://github.com/algolia/react-instantsearch/commit/9d53d86))
* **connectHierarchicalMenu:** use item.items instead of item.children (#1633) ([f712242](https://github.com/algolia/react-instantsearch/commit/f712242)), closes [#1605](https://github.com/algolia/react-instantsearch/issues/1605)
* **connectors:** remove itemComponent from hits connectors (#1557) ([0a4394a](https://github.com/algolia/react-instantsearch/commit/0a4394a)), closes [#1554](https://github.com/algolia/react-instantsearch/issues/1554)
* **connectRange:** when unfinite numbers are passed throw ([75bec0d](https://github.com/algolia/react-instantsearch/commit/75bec0d))
* **connectSearchBox:** handle `defaultRefinement` (#1829) ([7a730e2](https://github.com/algolia/react-instantsearch/commit/7a730e2)), closes [#1826](https://github.com/algolia/react-instantsearch/issues/1826)
* **connectSearchBox:** provide currentRefinement instead of query (#1654) ([f8bc432](https://github.com/algolia/react-instantsearch/commit/f8bc432))
* **core:** InstantSearch should accept 0 children (#1336) ([460df0d](https://github.com/algolia/react-instantsearch/commit/460df0d))
* **core:** recursively merge arrays in searchParameters ([dbadcdb](https://github.com/algolia/react-instantsearch/commit/dbadcdb)), closes [#80](https://github.com/algolia/react-instantsearch/issues/80)
* **counts:** missing formatNumber calls ([65e5ba0](https://github.com/algolia/react-instantsearch/commit/65e5ba0)), closes [#560](https://github.com/algolia/react-instantsearch/issues/560)
* **createConnector:** rename getProps into getProvidedProps (#1655) ([e605348](https://github.com/algolia/react-instantsearch/commit/e605348))
* **createConnector:** updates with latest props on state change (#1951) ([cd3a82c](https://github.com/algolia/react-instantsearch/commit/cd3a82c))
* **createInstantsearch:** fix missing props (#1867) ([8d319b5](https://github.com/algolia/react-instantsearch/commit/8d319b5)), closes [#1867](https://github.com/algolia/react-instantsearch/issues/1867)
* **createInstantSearchManager:** drop outdated response (#1765) ([76c5312](https://github.com/algolia/react-instantsearch/commit/76c5312))
* **cssClasses:** Fixed duplication of classNames ([e193f45](https://github.com/algolia/react-instantsearch/commit/e193f45)), closes [#388](https://github.com/algolia/react-instantsearch/issues/388)
* **currentRefinedValues:** allow array of strings for cssClasses.* ([55b3a3f](https://github.com/algolia/react-instantsearch/commit/55b3a3f))
* **currentRefinedValues:** clear numeric refinements using original value ([9a0ad45](https://github.com/algolia/react-instantsearch/commit/9a0ad45)), closes [#844](https://github.com/algolia/react-instantsearch/issues/844)
* **currentRefinements:** make removing a toggle refinement work  ([8995e64](https://github.com/algolia/react-instantsearch/commit/8995e64))
* **default translations:** fix default translations (#1656) ([d3a8e03](https://github.com/algolia/react-instantsearch/commit/d3a8e03)), closes [#1656](https://github.com/algolia/react-instantsearch/issues/1656)
* **doc:** add doctype were missing ([86a18aa](https://github.com/algolia/react-instantsearch/commit/86a18aa))
* **doc:** All wigdets in docs are not anymore linked together #fix #446 ([4361320](https://github.com/algolia/react-instantsearch/commit/4361320)), closes [#446](https://github.com/algolia/react-instantsearch/issues/446)
* **doc:** bolder font for the navigation ([64f6d56](https://github.com/algolia/react-instantsearch/commit/64f6d56))
* **doc:** ensure selector is not conflicting ([6528f2c](https://github.com/algolia/react-instantsearch/commit/6528f2c)), closes [#505](https://github.com/algolia/react-instantsearch/issues/505)
* **doc:** ensure the documentation content doesn't overflow ([1e28a4e](https://github.com/algolia/react-instantsearch/commit/1e28a4e)), closes [#444](https://github.com/algolia/react-instantsearch/issues/444)
* **doc:** Expand input on documentation page ([6814a14](https://github.com/algolia/react-instantsearch/commit/6814a14))
* **doc:** new color scheme ([deccc17](https://github.com/algolia/react-instantsearch/commit/deccc17))
* **doc:** only show a scrollbar when needed ([f2d955b](https://github.com/algolia/react-instantsearch/commit/f2d955b))
* **docs:** fixed bad link to scss in custom themes section ([823a859](https://github.com/algolia/react-instantsearch/commit/823a859))
* **docs:** improved label/input hover debug ([58573db](https://github.com/algolia/react-instantsearch/commit/58573db)), closes [#503](https://github.com/algolia/react-instantsearch/issues/503)
* **docs:** minor CSS fixes ([94fa868](https://github.com/algolia/react-instantsearch/commit/94fa868)), closes [#573](https://github.com/algolia/react-instantsearch/issues/573)
* **documentation:** Change instantsearch.widgets.stats typo data.processingTimMS to data.processingTimeMS ([034703e](https://github.com/algolia/react-instantsearch/commit/034703e))
* **documentation:** Change responsiveNavigation.js & header.html to fix #1090 ([bf3a808](https://github.com/algolia/react-instantsearch/commit/bf3a808)), closes [#1090](https://github.com/algolia/react-instantsearch/issues/1090)
* **example:** add default style for widget (#1661) ([76a0a3d](https://github.com/algolia/react-instantsearch/commit/76a0a3d))
* **example:** Example searchbox ([cdad6c7](https://github.com/algolia/react-instantsearch/commit/cdad6c7)), closes [#157](https://github.com/algolia/react-instantsearch/issues/157)
* **example:** Fix access to props in react-router example ([1417d6f](https://github.com/algolia/react-instantsearch/commit/1417d6f))
* **example:** link to instantsearch/react (#2007) ([5e674cd](https://github.com/algolia/react-instantsearch/commit/5e674cd))
* **examples:** issues with header & content of the examples (#1682) ([9c6c077](https://github.com/algolia/react-instantsearch/commit/9c6c077))
* **examples:** media logo ([64f850e](https://github.com/algolia/react-instantsearch/commit/64f850e))
* **examples:** override some bootstrap style for the website (#1507) ([e8d5296](https://github.com/algolia/react-instantsearch/commit/e8d5296))
* **examples/airbnb:** Use default theme from CDN ([f379c0a](https://github.com/algolia/react-instantsearch/commit/f379c0a)), closes [#522](https://github.com/algolia/react-instantsearch/issues/522)
* **examples/youtube:** use the default theme ([cf9a4b6](https://github.com/algolia/react-instantsearch/commit/cf9a4b6))
* **generateRanges:** avoid any infinite loop. Fix #351 ([4965222](https://github.com/algolia/react-instantsearch/commit/4965222)), closes [#351](https://github.com/algolia/react-instantsearch/issues/351)
* **getRefinements:** a name should be a string ([7efd1fd](https://github.com/algolia/react-instantsearch/commit/7efd1fd))
* **getRefinements:** hierarchical facets ([fe0fc5d](https://github.com/algolia/react-instantsearch/commit/fe0fc5d))
* **headerFooter:** make collapsible click handler work ([add0d50](https://github.com/algolia/react-instantsearch/commit/add0d50))
* **hideIfEmpty:** should be hideWhenNoResults ([21877a0](https://github.com/algolia/react-instantsearch/commit/21877a0))
* **hierarchical:** setPage 0 when toggling ([a976539](https://github.com/algolia/react-instantsearch/commit/a976539)), closes [#371](https://github.com/algolia/react-instantsearch/issues/371)
* **hierarchicalFacets:** use a real attribute name for the hierarchicalFacet name ([0d2a455](https://github.com/algolia/react-instantsearch/commit/0d2a455))
* **hierarchicalMenu:** configure maxValuesPerFacet using the limit option ([4868717](https://github.com/algolia/react-instantsearch/commit/4868717)), closes [#66](https://github.com/algolia/react-instantsearch/issues/66)
* **hierarchicalMenu:** handle cases where no results after a search ([0a1d0ac](https://github.com/algolia/react-instantsearch/commit/0a1d0ac)), closes [#385](https://github.com/algolia/react-instantsearch/issues/385)
* **hierarchicalMenu:** handle limit option ([968cf58](https://github.com/algolia/react-instantsearch/commit/968cf58)), closes [#585](https://github.com/algolia/react-instantsearch/issues/585) [#235](https://github.com/algolia/react-instantsearch/issues/235)
* **highlight:** highlight should work even if the attribute is missing (#1791) ([5b79b15](https://github.com/algolia/react-instantsearch/commit/5b79b15)), closes [#1790](https://github.com/algolia/react-instantsearch/issues/1790)
* **Highlight:** error message now says "attributeName" as it's the public prop (#1707) ([a5ceded](https://github.com/algolia/react-instantsearch/commit/a5ceded))
* **Highlight:** remove infinite loop (#1688) ([6ff18c3](https://github.com/algolia/react-instantsearch/commit/6ff18c3))
* **hits:** Fix warning about unique key in iterator ([0c9468c](https://github.com/algolia/react-instantsearch/commit/0c9468c))
* **hits:** rename __position to hitIndex ([d051a54](https://github.com/algolia/react-instantsearch/commit/d051a54))
* **Hits:** always render hits ([2e7bf8a](https://github.com/algolia/react-instantsearch/commit/2e7bf8a)), closes [#1100](https://github.com/algolia/react-instantsearch/issues/1100)
* **Hits:** handle the display when there is no result ([544ff5c](https://github.com/algolia/react-instantsearch/commit/544ff5c))
* **Hits:** Hits must trigger a search even if there's no searchParameter being set ([ff59970](https://github.com/algolia/react-instantsearch/commit/ff59970))
* **Hits:** limit the hitComponent to be only a function (#1912) ([b3c9578](https://github.com/algolia/react-instantsearch/commit/b3c9578))
* **hitsPerPageSelector:** Be more tolerant in options ([e14a344](https://github.com/algolia/react-instantsearch/commit/e14a344))
* **hitsPerPageSelector:** Issue when state did not have a `hitsPerPage` ([dc9371c](https://github.com/algolia/react-instantsearch/commit/dc9371c))
* **id:** remmove id props (#1564) ([a563894](https://github.com/algolia/react-instantsearch/commit/a563894)), closes [#1556](https://github.com/algolia/react-instantsearch/issues/1556)
* **IE11:** classList do not supports .add(class, class) ([ab10347](https://github.com/algolia/react-instantsearch/commit/ab10347)), closes [#989](https://github.com/algolia/react-instantsearch/issues/989)
* **index:** Use module.exports instead of export on index ([81e7eee](https://github.com/algolia/react-instantsearch/commit/81e7eee))
* **index-selector:** Fix tests passing with incorrect parameters ([8fc31b9](https://github.com/algolia/react-instantsearch/commit/8fc31b9))
* **index-selector:** Update usage and error ([a7e4c10](https://github.com/algolia/react-instantsearch/commit/a7e4c10))
* **InfiniteHits:** better classname to loadmore btn (#1789) ([ad2ded3](https://github.com/algolia/react-instantsearch/commit/ad2ded3))
* **InfiniteHits:** provide translation key for `Load More` (#2048) ([6130bf2](https://github.com/algolia/react-instantsearch/commit/6130bf2))
* **Instantsearch:** Update all props on InstantSearch (#1828) ([2ed9b49](https://github.com/algolia/react-instantsearch/commit/2ed9b49))
* **InstantSearch:** add specific `react-instantsearch ${version}` agent (#1844) ([a1113bc](https://github.com/algolia/react-instantsearch/commit/a1113bc))
* **InstantSearch:** Do not force having a wrapping div ([3e552c3](https://github.com/algolia/react-instantsearch/commit/3e552c3))
* **InstantSearch:** dont fire request/onsearchStateChange when unmounting (#26) ([9a1487a](https://github.com/algolia/react-instantsearch/commit/9a1487a))
* **InstantSearch:** throw error when init and render are not defined. Fixes #499 ([2830cd3](https://github.com/algolia/react-instantsearch/commit/2830cd3)), closes [#499](https://github.com/algolia/react-instantsearch/issues/499)
* **jsdoc:** use babel-node ([453dc21](https://github.com/algolia/react-instantsearch/commit/453dc21))
* **layout:** missing div (did we lost that fix?) ([9a515e4](https://github.com/algolia/react-instantsearch/commit/9a515e4))
* **lifecycle:** save configuration done in widget.init ([07d1fea](https://github.com/algolia/react-instantsearch/commit/07d1fea))
* **List:** disable show more button if no more item to display (#1482) ([9a46305](https://github.com/algolia/react-instantsearch/commit/9a46305)), closes [#1455](https://github.com/algolia/react-instantsearch/issues/1455)
* **lite:** use lite algoliasearch build (js client) ([219fa9f](https://github.com/algolia/react-instantsearch/commit/219fa9f)), closes [#1024](https://github.com/algolia/react-instantsearch/issues/1024)
* **live-doc:** adds a start at a responsive display ([c83967e](https://github.com/algolia/react-instantsearch/commit/c83967e))
* **live-doc:** adds navigation menu for smaller screens ([a6bb71e](https://github.com/algolia/react-instantsearch/commit/a6bb71e))
* **live-doc:** fixes flow for texts ([3855071](https://github.com/algolia/react-instantsearch/commit/3855071))
* **live-doc:** generates missing ul ([b43e6e2](https://github.com/algolia/react-instantsearch/commit/b43e6e2))
* **live-doc:** Momentum scroll for iPhone ([60a36ff](https://github.com/algolia/react-instantsearch/commit/60a36ff))
* **live-doc:** move scrollbars, removes useless ones ([548ae5f](https://github.com/algolia/react-instantsearch/commit/548ae5f))
* **live-doc:** moves octocat link to top. Removes stackOverflow ([8ff6a79](https://github.com/algolia/react-instantsearch/commit/8ff6a79))
* **live-doc:** Moves version in the main content ([27731c3](https://github.com/algolia/react-instantsearch/commit/27731c3))
* **live-doc:** uses only h4 and fixes style of h4 (mobile) ([0fdd2d0](https://github.com/algolia/react-instantsearch/commit/0fdd2d0))
* **live-reload:** integrates the links into the menu flow ([c118051](https://github.com/algolia/react-instantsearch/commit/c118051))
* **lodash:** stop leaking lodash in the global scope ([91f71dc](https://github.com/algolia/react-instantsearch/commit/91f71dc)), closes [#900](https://github.com/algolia/react-instantsearch/issues/900)
* **lodash:** use lodash v4, reduce build size ([216d1e0](https://github.com/algolia/react-instantsearch/commit/216d1e0))
* **menu:** selecting the currentRefinement should remove it. (#1637) ([0f67940](https://github.com/algolia/react-instantsearch/commit/0f67940))
* **menu:** send an empty array values when no values ([12cd7dc](https://github.com/algolia/react-instantsearch/commit/12cd7dc)), closes [#107](https://github.com/algolia/react-instantsearch/issues/107)
* **menu,refinementList:** sort by count AND name to avoid reorders on refine ([02fe7bf](https://github.com/algolia/react-instantsearch/commit/02fe7bf)), closes [#65](https://github.com/algolia/react-instantsearch/issues/65)
* **meteorjs:** lite build must point to the browser lite (#1097) ([265ace3](https://github.com/algolia/react-instantsearch/commit/265ace3)), closes [#1024](https://github.com/algolia/react-instantsearch/issues/1024) [#1024](https://github.com/algolia/react-instantsearch/issues/1024)
* **middle-click:** Allow middle click on links ([a7601c0](https://github.com/algolia/react-instantsearch/commit/a7601c0))
* **MultiIndex:** derived helper were using main index specifics params (#36) ([991fea6](https://github.com/algolia/react-instantsearch/commit/991fea6))
* **MultiIndex:** revert breaking change if no multiple index (#32) ([44f7de0](https://github.com/algolia/react-instantsearch/commit/44f7de0))
* **multipleChoiceList:** `limit` should be pure JS ([68bdf81](https://github.com/algolia/react-instantsearch/commit/68bdf81))
* **nouislider:** fix the slider for nouislider 8.5.1 ([af8f56b](https://github.com/algolia/react-instantsearch/commit/af8f56b))
* **numeric widgets:** synchronizes rounded value between widgets ([b314160](https://github.com/algolia/react-instantsearch/commit/b314160))
* **numeric-refinement:** Replace Array.find with lodash find/includes ([b3e815c](https://github.com/algolia/react-instantsearch/commit/b3e815c))
* **numeric-selector:** makes init comply with the new API ([068e8d3](https://github.com/algolia/react-instantsearch/commit/068e8d3))
* **numerical widgets:** s/facetName/attributeName ([f209f5d](https://github.com/algolia/react-instantsearch/commit/f209f5d)), closes [#431](https://github.com/algolia/react-instantsearch/issues/431)
* **numericRefinementList:** Correctly apply active class ([7cca9a4](https://github.com/algolia/react-instantsearch/commit/7cca9a4)), closes [#1010](https://github.com/algolia/react-instantsearch/issues/1010)
* **numericSelector:** pass currentValue as the refined value, not the full obj ([9286b4b](https://github.com/algolia/react-instantsearch/commit/9286b4b))
* **onClick:** do not replace the browser's behavior on special clicks ([8562d49](https://github.com/algolia/react-instantsearch/commit/8562d49)), closes [#278](https://github.com/algolia/react-instantsearch/issues/278)
* **package.json:** typo in repository ([33cf196](https://github.com/algolia/react-instantsearch/commit/33cf196))
* **pagination:** always transition state (#1289) ([cff56d0](https://github.com/algolia/react-instantsearch/commit/cff56d0)), closes [#1287](https://github.com/algolia/react-instantsearch/issues/1287)
* **pagination:** Disabled pagination link can no longer be clicked ([88b567f](https://github.com/algolia/react-instantsearch/commit/88b567f)), closes [#974](https://github.com/algolia/react-instantsearch/issues/974)
* **pagination:** do not generate the URL for disabled pages. ([e5d78ab](https://github.com/algolia/react-instantsearch/commit/e5d78ab)), closes [#282](https://github.com/algolia/react-instantsearch/issues/282)
* **pagination:** fix #668 edge case ([d8f1196](https://github.com/algolia/react-instantsearch/commit/d8f1196)), closes [#668](https://github.com/algolia/react-instantsearch/issues/668)
* **pagination:** Fix double BEM classes on elements ([2ede317](https://github.com/algolia/react-instantsearch/commit/2ede317)), closes [#500](https://github.com/algolia/react-instantsearch/issues/500)
* **pagination:** handle cases where maxPages is low ([d3c9959](https://github.com/algolia/react-instantsearch/commit/d3c9959)), closes [#100](https://github.com/algolia/react-instantsearch/issues/100)
* **pagination:** missing showFirstLast attribute when instanciating ([28fa0ae](https://github.com/algolia/react-instantsearch/commit/28fa0ae))
* **pagination:** remove default value of maxPages. Fixes #761 ([607fe9a](https://github.com/algolia/react-instantsearch/commit/607fe9a)), closes [#761](https://github.com/algolia/react-instantsearch/issues/761)
* **pagination:** reset on other filter + no toggle (#1360) ([bfed1f3](https://github.com/algolia/react-instantsearch/commit/bfed1f3))
* **Pagination:** fix and indicate when pagination is disabled ([5f20199](https://github.com/algolia/react-instantsearch/commit/5f20199)), closes [#1938](https://github.com/algolia/react-instantsearch/issues/1938)
* **Pagination:** when page === 1, first should not be selected (#1615) ([1cf042b](https://github.com/algolia/react-instantsearch/commit/1cf042b))
* **paginationLink:** it's aria-label not ariaLabel (#1125) ([70a190c](https://github.com/algolia/react-instantsearch/commit/70a190c))
* **poweredBy:** Extract its hiding capabilities ([f5fa9ee](https://github.com/algolia/react-instantsearch/commit/f5fa9ee)), closes [#189](https://github.com/algolia/react-instantsearch/issues/189)
* **poweredBy:** Let users define their own poweredBy template ([f1a96d8](https://github.com/algolia/react-instantsearch/commit/f1a96d8))
* **prepareTemplates:** uses templates with keys that are not in defaults ([c4bf8ec](https://github.com/algolia/react-instantsearch/commit/c4bf8ec))
* **price-ranges:** fix usage + add test ([89601d7](https://github.com/algolia/react-instantsearch/commit/89601d7))
* **price-ranges:** makes it uses same operator as the slider ([ad6f5c2](https://github.com/algolia/react-instantsearch/commit/ad6f5c2))
* **priceRanges:** fixed 'active' CSS class not using BEM ([ec0d1b1](https://github.com/algolia/react-instantsearch/commit/ec0d1b1))
* **priceRanges:** pass the bound refine to the form ([ce2b956](https://github.com/algolia/react-instantsearch/commit/ce2b956))
* **priceRanges:** plug the URL computation. Fix #354 ([fbf4022](https://github.com/algolia/react-instantsearch/commit/fbf4022)), closes [#354](https://github.com/algolia/react-instantsearch/issues/354)
* **priceRanges:** Remove round from first range ([bf82395](https://github.com/algolia/react-instantsearch/commit/bf82395))
* **pricesRange:** fill the form according to the current refinement (#1126) ([12ebde7](https://github.com/algolia/react-instantsearch/commit/12ebde7)), closes [#1009](https://github.com/algolia/react-instantsearch/issues/1009)
* **propTypes:** appId and apiKey are no more required when algoliaClient ([127fc38](https://github.com/algolia/react-instantsearch/commit/127fc38))
* **publish:** publish react-instantsearch/dist instead of root (#1884) ([64414e0](https://github.com/algolia/react-instantsearch/commit/64414e0))
* **range-slider:** check usage + display (fixes #395) ([301643a](https://github.com/algolia/react-instantsearch/commit/301643a)), closes [#395](https://github.com/algolia/react-instantsearch/issues/395)
* **range-slider:** fixes bound definition ([e15c9b7](https://github.com/algolia/react-instantsearch/commit/e15c9b7))
* **range-slider:** Use lodash find instead of Array.prototype.find ([056153c](https://github.com/algolia/react-instantsearch/commit/056153c))
* **rangeSlider:**     prevent slider from extending farther than the last pip ([6e534f5](https://github.com/algolia/react-instantsearch/commit/6e534f5))
* **rangeSlider:** error when no result ([70e8554](https://github.com/algolia/react-instantsearch/commit/70e8554))
* **rangeSlider:** fixed tooltip CSS & outdated default theme. ([c4be2ef](https://github.com/algolia/react-instantsearch/commit/c4be2ef))
* **rangeSlider:** handles now support stacking (#1129) ([ad394d3](https://github.com/algolia/react-instantsearch/commit/ad394d3))
* **rangeSlider:** refinements cleanuo ([16c132c](https://github.com/algolia/react-instantsearch/commit/16c132c)), closes [#147](https://github.com/algolia/react-instantsearch/issues/147)
* **rangeSlider:** restore wrongly removed state nesting ([3ed3d39](https://github.com/algolia/react-instantsearch/commit/3ed3d39))
* **rangeSlider:** step accepts a float value ([6ecc925](https://github.com/algolia/react-instantsearch/commit/6ecc925))
* **rangeSlider:** use stats min/max when only user min or max is provided (#1124) ([4348463](https://github.com/algolia/react-instantsearch/commit/4348463)), closes [#1004](https://github.com/algolia/react-instantsearch/issues/1004)
* **React:** compatibility with React 15.4.0 (#1578) ([ca434f1](https://github.com/algolia/react-instantsearch/commit/ca434f1)), closes [#1577](https://github.com/algolia/react-instantsearch/issues/1577)
* **React:** require React in order for JSX to work in widgets ([64d6011](https://github.com/algolia/react-instantsearch/commit/64d6011))
* **react-native:** use View as a container for react-native (#1729) ([5b76f75](https://github.com/algolia/react-instantsearch/commit/5b76f75)), closes [#1730](https://github.com/algolia/react-instantsearch/issues/1730)
* **react-nouislider:** upgrade react-nouislider to avoid mutating props ([1b7cd1d](https://github.com/algolia/react-instantsearch/commit/1b7cd1d))
* **react-router:** search was triggered two many times (#1840) ([25e9db5](https://github.com/algolia/react-instantsearch/commit/25e9db5))
* **recipes:** react router v4 ([de673bf](https://github.com/algolia/react-instantsearch/commit/de673bf))
* **refinementList:** ensure the key reflects the underlying state ([b048f0b](https://github.com/algolia/react-instantsearch/commit/b048f0b)), closes [#398](https://github.com/algolia/react-instantsearch/issues/398)
* **refinementList:** Remove `singleRefine` attribute ([db73e38](https://github.com/algolia/react-instantsearch/commit/db73e38)), closes [#220](https://github.com/algolia/react-instantsearch/issues/220)
* **refinementList:** singleRefine is not dependant from operator ([d29dff6](https://github.com/algolia/react-instantsearch/commit/d29dff6))
* **RefinementList:** click on child should not click on parent ([d476da2](https://github.com/algolia/react-instantsearch/commit/d476da2)), closes [#191](https://github.com/algolia/react-instantsearch/issues/191)
* **RefinementList:** use attributeNameKey when calling createURL ([253ec28](https://github.com/algolia/react-instantsearch/commit/253ec28))
* **refinementList/header:** rename count to refinedFacetCount ([89ad602](https://github.com/algolia/react-instantsearch/commit/89ad602))
* **rootpath:** remember rootpath option on 'back' button ([01ecdaa](https://github.com/algolia/react-instantsearch/commit/01ecdaa))
* **search:** don't update widgets if props hasn't changed (#1612) ([6e121ef](https://github.com/algolia/react-instantsearch/commit/6e121ef))
* **search-box:** Fix #137 autofocus must be configurable ([51f01be](https://github.com/algolia/react-instantsearch/commit/51f01be)), closes [#137](https://github.com/algolia/react-instantsearch/issues/137)
* **search-box:** update value when state changes from the outside ([4550f99](https://github.com/algolia/react-instantsearch/commit/4550f99))
* **searchBox:** allow searchBox to reuse an `<input>` ([e820cc3](https://github.com/algolia/react-instantsearch/commit/e820cc3))
* **searchBox:** do not trigger a search when input value is the same ([81c2e80](https://github.com/algolia/react-instantsearch/commit/81c2e80))
* **searchBox:** do not update input's value if focused ([0e85f0d](https://github.com/algolia/react-instantsearch/commit/0e85f0d)), closes [#163](https://github.com/algolia/react-instantsearch/issues/163)
* **searchBox:** do not update the input when focused ([61cf9be](https://github.com/algolia/react-instantsearch/commit/61cf9be)), closes [#944](https://github.com/algolia/react-instantsearch/issues/944)
* **searchBox:** fixes cssClasses option ([660ee2f](https://github.com/algolia/react-instantsearch/commit/660ee2f)), closes [#775](https://github.com/algolia/react-instantsearch/issues/775)
* **searchBox:** force cursor position to be at the end of the query (#1123) ([8a27769](https://github.com/algolia/react-instantsearch/commit/8a27769)), closes [#946](https://github.com/algolia/react-instantsearch/issues/946)
* **searchBox:** handle BFCache browsers (#1212) ([7deb9c3](https://github.com/algolia/react-instantsearch/commit/7deb9c3))
* **searchBox:** handle external updates of the query ([6a0af14](https://github.com/algolia/react-instantsearch/commit/6a0af14)), closes [#803](https://github.com/algolia/react-instantsearch/issues/803)
* **searchBox:** handling pasting event with contextual menu. ([a172458](https://github.com/algolia/react-instantsearch/commit/a172458)), closes [#467](https://github.com/algolia/react-instantsearch/issues/467)
* **searchBox:** IE8, IE9 needs to listen for setQuery ([97c166a](https://github.com/algolia/react-instantsearch/commit/97c166a))
* **searchBox:** stop setting the query twice ([91270b2](https://github.com/algolia/react-instantsearch/commit/91270b2))
* **searchBox:** stop updating query at eachkeystroke with searchOnEnterKeyPressOnly ([28dc4d2](https://github.com/algolia/react-instantsearch/commit/28dc4d2)), closes [#875](https://github.com/algolia/react-instantsearch/issues/875)
* **searchBox:** update helper query on every keystroke (#1127) ([997c0c2](https://github.com/algolia/react-instantsearch/commit/997c0c2)), closes [#1015](https://github.com/algolia/react-instantsearch/issues/1015)
* **searchBox:** Use `hasAttribute` instead of `getAttribute` ([a122af9](https://github.com/algolia/react-instantsearch/commit/a122af9))
* **SearchBox:** autocomplete was not disabled by default (#1742) ([bc76618](https://github.com/algolia/react-instantsearch/commit/bc76618))
* **SearchBox:** better mobile behaviour by default ([ea968b3](https://github.com/algolia/react-instantsearch/commit/ea968b3))
* **SearchBox:** Missing poweredBy in the not focused SearchBox ([ef695ff](https://github.com/algolia/react-instantsearch/commit/ef695ff))
* **SearchBox:** Safari can only have <use> with xlinkHref (#1970) ([7ab00bd](https://github.com/algolia/react-instantsearch/commit/7ab00bd)), closes [#1968](https://github.com/algolia/react-instantsearch/issues/1968)
* **searchParameters:** avoid mutating provided objects (#1148) ([0ea3bef](https://github.com/algolia/react-instantsearch/commit/0ea3bef)), closes [#1130](https://github.com/algolia/react-instantsearch/issues/1130)
* **selector:** makes component as uncontrolled component ([1dda12a](https://github.com/algolia/react-instantsearch/commit/1dda12a))
* **SFFV:** correct propTypes and add missing default values (#1845) ([a4c1b31](https://github.com/algolia/react-instantsearch/commit/a4c1b31))
* **SFFV:** empty query triggered a new SFFV (#1875) ([6c8259a](https://github.com/algolia/react-instantsearch/commit/6c8259a))
* **SFFV:** fix wrong query behaviour with slow network (#2086) ([c251e8f](https://github.com/algolia/react-instantsearch/commit/c251e8f)), closes [#2086](https://github.com/algolia/react-instantsearch/issues/2086)
* **SFFV:** translations for searchbox were not applied (#1879) ([e9b4ee1](https://github.com/algolia/react-instantsearch/commit/e9b4ee1))
* **showmore:** now showMore in doc and also show-more BEM ([a020439](https://github.com/algolia/react-instantsearch/commit/a020439))
* **showMore:** hide "show less" when nothing to hide ([5ac2bb6](https://github.com/algolia/react-instantsearch/commit/5ac2bb6))
* **showMore:** hide showMore when no more facet values to show ([cc31b1a](https://github.com/algolia/react-instantsearch/commit/cc31b1a))
* **slider:** allow handles to reach the real start and end of the slider ([03ed3f5](https://github.com/algolia/react-instantsearch/commit/03ed3f5))
* **slider:** fix tap event throwing ([d906d3e](https://github.com/algolia/react-instantsearch/commit/d906d3e)), closes [#120](https://github.com/algolia/react-instantsearch/issues/120)
* **slider:** fixed `pip` propTypes constraint ([c77b7f4](https://github.com/algolia/react-instantsearch/commit/c77b7f4))
* **slider:** hide slider if when no hits/matches ([31e4a80](https://github.com/algolia/react-instantsearch/commit/31e4a80)), closes [#107](https://github.com/algolia/react-instantsearch/issues/107)
* **slider:** hide the slider when stats.min=stats.max ([42e4b64](https://github.com/algolia/react-instantsearch/commit/42e4b64))
* **Slider:** cssClasses.body handled by headerFooter HOC ([d8d20b2](https://github.com/algolia/react-instantsearch/commit/d8d20b2))
* **Slider:** do not render Slider when range.min === range.max ([f20274e](https://github.com/algolia/react-instantsearch/commit/f20274e))
* **starRating:** call createURL with the right interface (min/max) (#1747) ([f9ab9b6](https://github.com/algolia/react-instantsearch/commit/f9ab9b6))
* **starRating:** Retrieve the correct count and use numericRefinement ([f00ce38](https://github.com/algolia/react-instantsearch/commit/f00ce38)), closes [#615](https://github.com/algolia/react-instantsearch/issues/615)
* **StarRating:** Do not show lowest rating as clickable when no action done ([50b72bb](https://github.com/algolia/react-instantsearch/commit/50b72bb)), closes [#1650](https://github.com/algolia/react-instantsearch/issues/1650)
* **StarRating:** usage with filters (#1933) ([667e9d5](https://github.com/algolia/react-instantsearch/commit/667e9d5))
* **starRatings:** click on selected range doesn't unselect it (#1766) ([beacc72](https://github.com/algolia/react-instantsearch/commit/beacc72))
* **state:** when having two widgets of the same type, state were erased when refining (#1686) ([0d5681e](https://github.com/algolia/react-instantsearch/commit/0d5681e))
* **stats:** Move CSS classes definition to widget from component ([99073cd](https://github.com/algolia/react-instantsearch/commit/99073cd))
* **storybook:** change naming for default refinement (#1433) ([8ed09f6](https://github.com/algolia/react-instantsearch/commit/8ed09f6))
* **style:** keyframes ([40eb0a5](https://github.com/algolia/react-instantsearch/commit/40eb0a5))
* **template:** throw when no way to deal with the template type ([f5d151a](https://github.com/algolia/react-instantsearch/commit/f5d151a))
* **template:** transformData checks too strict ([609f123](https://github.com/algolia/react-instantsearch/commit/609f123)), closes [#347](https://github.com/algolia/react-instantsearch/issues/347)
* **Template:** add default value for template ([4291014](https://github.com/algolia/react-instantsearch/commit/4291014))
* **Template:** now render() when templateKey changes ([8906224](https://github.com/algolia/react-instantsearch/commit/8906224))
* **Template:** stop leaking `data="[object Object]"` attributes in production builds ([7ec0431](https://github.com/algolia/react-instantsearch/commit/7ec0431)), closes [#899](https://github.com/algolia/react-instantsearch/issues/899)
* **templatesConfig:** helpers are now following Mustache spec ([8f3502f](https://github.com/algolia/react-instantsearch/commit/8f3502f))
* **test:** add missing Snippet and Highliter snapshot ([4accce5](https://github.com/algolia/react-instantsearch/commit/4accce5))
* **theme:** Revert default spacing into pagination ([d755fd5](https://github.com/algolia/react-instantsearch/commit/d755fd5))
* **toggle:** add backward compatibility for previous toggle implem (#1154) ([a1973a0](https://github.com/algolia/react-instantsearch/commit/a1973a0))
* **toggle:** make autoHide check facetValue.count (#1213) ([86872eb](https://github.com/algolia/react-instantsearch/commit/86872eb))
* **toggle:** pass isRefined to toggleRefinement ([8ac494e](https://github.com/algolia/react-instantsearch/commit/8ac494e))
* **toggle:** read numerical facet results stats for toggle count (#1098) ([1feb539](https://github.com/algolia/react-instantsearch/commit/1feb539)), closes [#1096](https://github.com/algolia/react-instantsearch/issues/1096)
* **transformData:** add an explicit error message ([94c53d3](https://github.com/algolia/react-instantsearch/commit/94c53d3)), closes [#212](https://github.com/algolia/react-instantsearch/issues/212)
* **transformData:** this test is not needed, already covered by Template ([36e5b9c](https://github.com/algolia/react-instantsearch/commit/36e5b9c))
* **typo:** replace onSearchState by searchState (#1691) ([7b01f61](https://github.com/algolia/react-instantsearch/commit/7b01f61))
* **umd:** Add connectors to UMD build (#1988) ([23ac5e6](https://github.com/algolia/react-instantsearch/commit/23ac5e6)), closes [#1987](https://github.com/algolia/react-instantsearch/issues/1987)
* **url:** allow hierarchical facets in trackedParameters ([36b4011](https://github.com/algolia/react-instantsearch/commit/36b4011))
* **url:** removed facet were still present in the url with empty value (#1453) ([56ff513](https://github.com/algolia/react-instantsearch/commit/56ff513))
* **url sync:** back/forward button were not working (#1579) ([54533e5](https://github.com/algolia/react-instantsearch/commit/54533e5))
* **url-sync:** adds indexName in the helper configuration ([c2c0bc7](https://github.com/algolia/react-instantsearch/commit/c2c0bc7))
* **url-sync:** adds indexName in the helper configuration ([e50bafd](https://github.com/algolia/react-instantsearch/commit/e50bafd))
* **url-sync:** always decode incoming query string ([bea38e3](https://github.com/algolia/react-instantsearch/commit/bea38e3)), closes [#848](https://github.com/algolia/react-instantsearch/issues/848)
* **url-sync:** handle <base> href pages ([e58aadc](https://github.com/algolia/react-instantsearch/commit/e58aadc)), closes [#790](https://github.com/algolia/react-instantsearch/issues/790)
* toggleRefine was no more working ([e6e35df](https://github.com/algolia/react-instantsearch/commit/e6e35df))
* **url-sync:** handle both hash and query parameter fix #165 ([8d84de6](https://github.com/algolia/react-instantsearch/commit/8d84de6)), closes [#165](https://github.com/algolia/react-instantsearch/issues/165)
* **url-sync:** make input not to lose focus ([63488d3](https://github.com/algolia/react-instantsearch/commit/63488d3))
* **url-sync:** Makes url sync more reliable ([3157abc](https://github.com/algolia/react-instantsearch/commit/3157abc)), closes [#730](https://github.com/algolia/react-instantsearch/issues/730) [#729](https://github.com/algolia/react-instantsearch/issues/729)
* **urlsync:** urlSync should be opt-in. fix #1341 (#1474) ([bed41d3](https://github.com/algolia/react-instantsearch/commit/bed41d3)), closes [#1341](https://github.com/algolia/react-instantsearch/issues/1341) [#1474](https://github.com/algolia/react-instantsearch/issues/1474)
* Set `cssClass` as optional in documentation ([e7ac953](https://github.com/algolia/react-instantsearch/commit/e7ac953))
* **urlSync:** only start watching for changes at first render ([4a672ae](https://github.com/algolia/react-instantsearch/commit/4a672ae))
* **urlSync:** urls should be safe by default (#1104) ([db833c6](https://github.com/algolia/react-instantsearch/commit/db833c6)), closes [#982](https://github.com/algolia/react-instantsearch/issues/982)
* **util:** remove empty key was removing non object key (#29) ([9f795c7](https://github.com/algolia/react-instantsearch/commit/9f795c7))
* **validate-commit:** Update the regexp ([96b93ba](https://github.com/algolia/react-instantsearch/commit/96b93ba))
* **website:** broken demo links (#1802) ([0abe2f5](https://github.com/algolia/react-instantsearch/commit/0abe2f5))
* **website:** defered doc scripts ([0c1324f](https://github.com/algolia/react-instantsearch/commit/0c1324f))
* **website:** demos link to https ([b69c0f5](https://github.com/algolia/react-instantsearch/commit/b69c0f5))
* **website:** doc layout responsive ([a4dc894](https://github.com/algolia/react-instantsearch/commit/a4dc894))
* **website:** fix images path ([a3f62eb](https://github.com/algolia/react-instantsearch/commit/a3f62eb))
* **website:** fixed space overlay color animation ([200b8a7](https://github.com/algolia/react-instantsearch/commit/200b8a7))
* **website:** Fixes & responsive stuff for doc ([7a8f920](https://github.com/algolia/react-instantsearch/commit/7a8f920))
* **website:** footer markup ([95364a1](https://github.com/algolia/react-instantsearch/commit/95364a1))
* **website:** footer wording ([8355460](https://github.com/algolia/react-instantsearch/commit/8355460))
* **website:** home.js lint ([b70e06e](https://github.com/algolia/react-instantsearch/commit/b70e06e))
* **website:** icon-theme didn't like svgo (to fix) ([38d84af](https://github.com/algolia/react-instantsearch/commit/38d84af))
* **website:** image alt ([30cca29](https://github.com/algolia/react-instantsearch/commit/30cca29))
* **website:** jsdelivr for every scripts ([06591d4](https://github.com/algolia/react-instantsearch/commit/06591d4))
* **website:** Nav Icon + logo ([c1f419c](https://github.com/algolia/react-instantsearch/commit/c1f419c))
* **website:** only load what's needed in bootstrap ([4843474](https://github.com/algolia/react-instantsearch/commit/4843474))
* Keep `en-EN` as demo default ([6c2a043](https://github.com/algolia/react-instantsearch/commit/6c2a043))
* More explicit error message when DOM selector is invalid ([d36a2ad](https://github.com/algolia/react-instantsearch/commit/d36a2ad)), closes [#105](https://github.com/algolia/react-instantsearch/issues/105)
* no more needed to override css class here ([2b314c0](https://github.com/algolia/react-instantsearch/commit/2b314c0))
* no need for a flag in refinementList refine() ([9b8fa3f](https://github.com/algolia/react-instantsearch/commit/9b8fa3f))
* no state needed for Hogan component ([d8a3a4c](https://github.com/algolia/react-instantsearch/commit/d8a3a4c))
* Pass nbHits, hitsPerPage, nbPages and page to Stats widget ([deefd23](https://github.com/algolia/react-instantsearch/commit/deefd23)), closes [#106](https://github.com/algolia/react-instantsearch/issues/106)
* react-nouislider will live in our repo for now ([49520f1](https://github.com/algolia/react-instantsearch/commit/49520f1))
* reduce the dependency between REACT components and helper ([9309a4c](https://github.com/algolia/react-instantsearch/commit/9309a4c))
* Remove `htmlAttribute` in favor of `cssClass` ([59a0bc5](https://github.com/algolia/react-instantsearch/commit/59a0bc5))
* remove data-role from searchBox ([bdfe6d3](https://github.com/algolia/react-instantsearch/commit/bdfe6d3))
* remove linebreak ([e5f1720](https://github.com/algolia/react-instantsearch/commit/e5f1720))
* rename BEM root algolia-magic to as ([5f3329d](https://github.com/algolia/react-instantsearch/commit/5f3329d)), closes [#24](https://github.com/algolia/react-instantsearch/issues/24)
* **widgets:** add 300px width for the default SearchBox (#1803) ([bf5d791](https://github.com/algolia/react-instantsearch/commit/bf5d791))
* rename results component to hits ([7b9eb25](https://github.com/algolia/react-instantsearch/commit/7b9eb25))
* set visibility:hidden by default for uneeded pagination links ([19fddba](https://github.com/algolia/react-instantsearch/commit/19fddba)), closes [#37](https://github.com/algolia/react-instantsearch/issues/37)
* strict container check ([ec23e34](https://github.com/algolia/react-instantsearch/commit/ec23e34))
* switch back to divs, rendering glitch ([b44943a](https://github.com/algolia/react-instantsearch/commit/b44943a))
* update algoliasearch and algoliasearch-helper ([e944d12](https://github.com/algolia/react-instantsearch/commit/e944d12))
* upgrade all libs, switch to ^ dependencies ([79d0a64](https://github.com/algolia/react-instantsearch/commit/79d0a64))
* Use `appId` and `apiKey` keys ([5716552](https://github.com/algolia/react-instantsearch/commit/5716552))
* **website:** removed animation debug ([01ac079](https://github.com/algolia/react-instantsearch/commit/01ac079))
* use cssClass instead of inputClass or addClass ([6826bd6](https://github.com/algolia/react-instantsearch/commit/6826bd6))
* use toggleRefinement ([b497b02](https://github.com/algolia/react-instantsearch/commit/b497b02))
* widgets.searchbox => widgets.searchBox ([6c49e18](https://github.com/algolia/react-instantsearch/commit/6c49e18))
* wrap in an li the checkbox ([dfe629d](https://github.com/algolia/react-instantsearch/commit/dfe629d))
* **website:** space bg fadeIn ([5e09844](https://github.com/algolia/react-instantsearch/commit/5e09844))
* **website:** unclosed content block ([d42dc3e](https://github.com/algolia/react-instantsearch/commit/d42dc3e))
* **widgets:** replace setImmediate use with Promise use when update is needed (#1811) ([17e2497](https://github.com/algolia/react-instantsearch/commit/17e2497))
* **withSearchBox:** keep displaying searchBox when no items found (#1930) ([30de4cd](https://github.com/algolia/react-instantsearch/commit/30de4cd))


### Chores

* **indexSelector:** renamed to sortBySelector ([df9b9ce](https://github.com/algolia/react-instantsearch/commit/df9b9ce)), closes [#485](https://github.com/algolia/react-instantsearch/issues/485)
* **template:** get rid of extra <div /> wrapping the Template if possible. ([04cc232](https://github.com/algolia/react-instantsearch/commit/04cc232)), closes [#422](https://github.com/algolia/react-instantsearch/issues/422)
* **themes:** move from `default.css` theme to core `instantsearch.css` ([1f8ca35](https://github.com/algolia/react-instantsearch/commit/1f8ca35)), closes [#406](https://github.com/algolia/react-instantsearch/issues/406)


### Code Refactoring

* **history:** remove our mode when  we handle history object from the history lib (#1540) ([ed2ae84](https://github.com/algolia/react-instantsearch/commit/ed2ae84))


### Documentation

* **guides:** add a guide explaining how to use react-router with ris (#1527) ([a947404](https://github.com/algolia/react-instantsearch/commit/a947404))
* **requirements:** Add Algolia requirements to the doc ([110570c](https://github.com/algolia/react-instantsearch/commit/110570c))
* **storybook:** integrate storybook example to our docs (#1469) ([35469bc](https://github.com/algolia/react-instantsearch/commit/35469bc))
* **widgets:** add jsdoc to widgets (#1495) ([88947a7](https://github.com/algolia/react-instantsearch/commit/88947a7))


### Features

* Add `htmlAttributes` to indexSelector ([ceed8ae](https://github.com/algolia/react-instantsearch/commit/ceed8ae))
* Add stats widget ([8290542](https://github.com/algolia/react-instantsearch/commit/8290542))
* Add support for `className` ([898a2fa](https://github.com/algolia/react-instantsearch/commit/898a2fa))
* Add Toggle example ([d801807](https://github.com/algolia/react-instantsearch/commit/d801807))
* Check that currentIndex is in indices list ([494dbe9](https://github.com/algolia/react-instantsearch/commit/494dbe9))
* example now uses the instant_search index ([63b4b50](https://github.com/algolia/react-instantsearch/commit/63b4b50))
* expose instantsearch.version ([ae5ef94](https://github.com/algolia/react-instantsearch/commit/ae5ef94))
* expose instantsearch() as main init method ([27baf55](https://github.com/algolia/react-instantsearch/commit/27baf55)), closes [#6](https://github.com/algolia/react-instantsearch/issues/6)
* formatNumber in Stats widget ([cf6a83c](https://github.com/algolia/react-instantsearch/commit/cf6a83c))
* hierarchicalWidget ([1facd9d](https://github.com/algolia/react-instantsearch/commit/1facd9d))
* **core:** sends a custom User Agent ([2561154](https://github.com/algolia/react-instantsearch/commit/2561154))
* indexSelector widget ([b60ed36](https://github.com/algolia/react-instantsearch/commit/b60ed36))
* multipleChoiceList => refinementList ([423542d](https://github.com/algolia/react-instantsearch/commit/423542d)), closes [#64](https://github.com/algolia/react-instantsearch/issues/64)
* multipleChoiceList first iteration ([bc91bfb](https://github.com/algolia/react-instantsearch/commit/bc91bfb))
* MutlipleChoiceList second pass ([ac74dfb](https://github.com/algolia/react-instantsearch/commit/ac74dfb))
* pagination component ([fad2720](https://github.com/algolia/react-instantsearch/commit/fad2720))
* pimp the npm run dev example using instant search data ([ea666ad](https://github.com/algolia/react-instantsearch/commit/ea666ad)), closes [#20](https://github.com/algolia/react-instantsearch/issues/20)
* ***Hits:** rename itemComponent to hitComponent (#1689) ([7724b2d](https://github.com/algolia/react-instantsearch/commit/7724b2d))
* **api:** add data to CurrentRefinements connector (#1550) ([a9dd0a5](https://github.com/algolia/react-instantsearch/commit/a9dd0a5))
* **api:** add namespace when storing widgets state (#1627) ([fbd4cd8](https://github.com/algolia/react-instantsearch/commit/fbd4cd8))
* **api:** Expose `algoliaClient` prop in InstantSearch (#1511) ([7f43fd5](https://github.com/algolia/react-instantsearch/commit/7f43fd5))
* **api:** fix consistency between CurrentFilters and Reset widgets (#1473) ([26ba222](https://github.com/algolia/react-instantsearch/commit/26ba222)), closes [#1473](https://github.com/algolia/react-instantsearch/issues/1473)
* **api:** make hitsPerPage and SortBy connector consistent (#1659) ([2a9c18d](https://github.com/algolia/react-instantsearch/commit/2a9c18d))
* **api:** remove error widget (#1488) ([a1c8bc5](https://github.com/algolia/react-instantsearch/commit/a1c8bc5))
* **api:** remove the range slider implementation (#1475) ([235413f](https://github.com/algolia/react-instantsearch/commit/235413f))
* **api:** remove translations for count in List and Menu (#1519) ([157e144](https://github.com/algolia/react-instantsearch/commit/157e144)), closes [#1249](https://github.com/algolia/react-instantsearch/issues/1249)
* **api:** remove usage of theme/extendTheme in our examples (#1486) ([2fb3a0b](https://github.com/algolia/react-instantsearch/commit/2fb3a0b))
* **api:** rename page props to currentRefinement for pagination widget (#1499) ([f86c07b](https://github.com/algolia/react-instantsearch/commit/f86c07b))
* **api:** renaming state/onStateChange to searchState/onSearchStateChange for InstantSearch component (#1667) ([f009c95](https://github.com/algolia/react-instantsearch/commit/f009c95))
* **API:** new export strategy (#1465) ([ff51a03](https://github.com/algolia/react-instantsearch/commit/ff51a03)), closes [#1454](https://github.com/algolia/react-instantsearch/issues/1454)
* **bem:** Add BEM to the index-selector widget ([564da51](https://github.com/algolia/react-instantsearch/commit/564da51))
* **bem:** Add BEM-styling to the Stats widget ([92cebeb](https://github.com/algolia/react-instantsearch/commit/92cebeb))
* **build:** Add minified CSS theme version to build ([77f0640](https://github.com/algolia/react-instantsearch/commit/77f0640))
* **build:** allow building React based custom widgets ([cfbbfe4](https://github.com/algolia/react-instantsearch/commit/cfbbfe4)), closes [#373](https://github.com/algolia/react-instantsearch/issues/373)
* **clearAll:** Add optional excludeAttributes to list protected filters ([fe6d19c](https://github.com/algolia/react-instantsearch/commit/fe6d19c))
* **clearAll:** New widget ([9e61a14](https://github.com/algolia/react-instantsearch/commit/9e61a14))
* **ClearAll:** add withQuery to also clear the search query (#1958) ([c0e695b](https://github.com/algolia/react-instantsearch/commit/c0e695b))
* **clearRefinements:** Added two utils methods ([49564e1](https://github.com/algolia/react-instantsearch/commit/49564e1))
* **collapsable widgets:** add collapsable and collapsed option ([c4df7c5](https://github.com/algolia/react-instantsearch/commit/c4df7c5))
* **connector:** remove loading (#1503) ([f83666e](https://github.com/algolia/react-instantsearch/commit/f83666e))
* **connectors:** consistent connectors API second pass (#1494) ([887ca7b](https://github.com/algolia/react-instantsearch/commit/887ca7b))
* **connectors API:** consistent default/current refinement naming (#1423) ([eb1c8a1](https://github.com/algolia/react-instantsearch/commit/eb1c8a1))
* **core/lifecycle-event:** emits `render` when render ([7f03ae9](https://github.com/algolia/react-instantsearch/commit/7f03ae9))
* **CurrentFilters:** remove `key`, remove `hide`, rename filters to `items` (#1445) ([dd8180d](https://github.com/algolia/react-instantsearch/commit/dd8180d))
* **currentRefinedValues:** new widget ([6c926d0](https://github.com/algolia/react-instantsearch/commit/6c926d0)), closes [#404](https://github.com/algolia/react-instantsearch/issues/404)
* **es7:** Enable `es7.objectRestSpread` ([fc2fbc4](https://github.com/algolia/react-instantsearch/commit/fc2fbc4))
* **examples:** try examples instead of themes ([bedffce](https://github.com/algolia/react-instantsearch/commit/bedffce))
* **header:** Pass count of current refined filters in header ([d9e8582](https://github.com/algolia/react-instantsearch/commit/d9e8582)), closes [#1013](https://github.com/algolia/react-instantsearch/issues/1013) [#1041](https://github.com/algolia/react-instantsearch/issues/1041)
* **headerFooter:** Add BEM classes to header and footer ([9e9d438](https://github.com/algolia/react-instantsearch/commit/9e9d438)), closes [#259](https://github.com/algolia/react-instantsearch/issues/259)
* **headerFooter:** Only add markup if a template is defined ([7a2d22d](https://github.com/algolia/react-instantsearch/commit/7a2d22d)), closes [#370](https://github.com/algolia/react-instantsearch/issues/370)
* **hierarchical:** expose rootPath and showParentLevel ([6e9bb7c](https://github.com/algolia/react-instantsearch/commit/6e9bb7c))
* **hierarchical-menu:** Add BEM classes ([58ec191](https://github.com/algolia/react-instantsearch/commit/58ec191))
* **hierarchical-menu:** Add CSS classes dependent on the depth ([1256ea8](https://github.com/algolia/react-instantsearch/commit/1256ea8))
* **hierarchicalMenu:** Adding indentation with default theme ([34885d2](https://github.com/algolia/react-instantsearch/commit/34885d2))
* **highlight:** provide a function to use highligth in react (#1346) ([4ad7e53](https://github.com/algolia/react-instantsearch/commit/4ad7e53))
* **Highlight:** provide Highlight widget and connectHighlight connector ([7e79db6](https://github.com/algolia/react-instantsearch/commit/7e79db6))
* **Highlighter:** allow rendering to custom tag (#11) ([52a1212](https://github.com/algolia/react-instantsearch/commit/52a1212))
* **hits:** Add a `__position` attribute to data passed to items ([43ce1c7](https://github.com/algolia/react-instantsearch/commit/43ce1c7)), closes [#903](https://github.com/algolia/react-instantsearch/issues/903)
* **hits:** Add BEM styling to the `hits` widget ([6681960](https://github.com/algolia/react-instantsearch/commit/6681960))
* **hits:** adds allItems template as an alternative to item ([1f3f889](https://github.com/algolia/react-instantsearch/commit/1f3f889))
* **hits-per-page-selector:** New widget to change hitsPerPage ([a3e0f78](https://github.com/algolia/react-instantsearch/commit/a3e0f78)), closes [#331](https://github.com/algolia/react-instantsearch/issues/331)
* **hitsPerPage:** hitsPerPage is now only configured by HitsPerPage (#1653) ([6ada577](https://github.com/algolia/react-instantsearch/commit/6ada577))
* **InfiniteHits:** add an infinite hits widgets with load more (#1483) ([b446cb2](https://github.com/algolia/react-instantsearch/commit/b446cb2)), closes [#1344](https://github.com/algolia/react-instantsearch/issues/1344)
* **InfiniteHits:** Add class to load more button (#1787) ([416febd](https://github.com/algolia/react-instantsearch/commit/416febd))
* **instantsearch:** allow overriding the helper.search function ([9a930e7](https://github.com/algolia/react-instantsearch/commit/9a930e7))
* **lifecycle:** makes init API consistent with the rest ([e7ed81f](https://github.com/algolia/react-instantsearch/commit/e7ed81f))
* **menu:** Add BEM classes ([467f49e](https://github.com/algolia/react-instantsearch/commit/467f49e))
* **menu:** add showMore option ([e7e7677](https://github.com/algolia/react-instantsearch/commit/e7e7677)), closes [#815](https://github.com/algolia/react-instantsearch/issues/815)
* **menu:** first widget version ([a888143](https://github.com/algolia/react-instantsearch/commit/a888143))
* **Menu, connectMenu:** add search for facet values (#1822) ([a6c513e](https://github.com/algolia/react-instantsearch/commit/a6c513e))
* **menu,refinementList:** add header/item/footer templating solution ([58275dc](https://github.com/algolia/react-instantsearch/commit/58275dc)), closes [#101](https://github.com/algolia/react-instantsearch/issues/101)
* **multi-index:** ease multi index and auto complete ([09a4e1d](https://github.com/algolia/react-instantsearch/commit/09a4e1d))
* **MultiRange:** add an all range (#1959) ([a3dc950](https://github.com/algolia/react-instantsearch/commit/a3dc950))
* **MultiRange:** indicate if a range has no refinements (#1926) ([80b6450](https://github.com/algolia/react-instantsearch/commit/80b6450))
* **numericRefinementList:** create numericRefinementList widget using refinementList component ([a29e9c7](https://github.com/algolia/react-instantsearch/commit/a29e9c7))
* **pagination:** add `scrollTo` option ([e6cd621](https://github.com/algolia/react-instantsearch/commit/e6cd621)), closes [#73](https://github.com/algolia/react-instantsearch/issues/73)
* **pagination:** add hitsPerPage and maxPages options ([7e558ce](https://github.com/algolia/react-instantsearch/commit/7e558ce))
* **pagination:** start the pagination at 1 (#1464) ([c6720de](https://github.com/algolia/react-instantsearch/commit/c6720de))
* **panel:** add a panel widget (#1889) ([594e1a1](https://github.com/algolia/react-instantsearch/commit/594e1a1))
* **poweredBy:** automatically add utm link to poweredBy ([05d1425](https://github.com/algolia/react-instantsearch/commit/05d1425)), closes [#711](https://github.com/algolia/react-instantsearch/issues/711)
* **priceRanges:** Add BEM classes and tests ([ad58d7a](https://github.com/algolia/react-instantsearch/commit/ad58d7a)), closes [#387](https://github.com/algolia/react-instantsearch/issues/387)
* **priceRanges:** add currency option ([f41484a](https://github.com/algolia/react-instantsearch/commit/f41484a))
* **priceRanges:** new Amazon-style price ranges widget ([e5fe344](https://github.com/algolia/react-instantsearch/commit/e5fe344))
* **priceRanges:** polish priceRanges widget ([0994e6f](https://github.com/algolia/react-instantsearch/commit/0994e6f))
* **rangeSlider:** add headerFooter decorator ([19090c3](https://github.com/algolia/react-instantsearch/commit/19090c3))
* **rangeSlider:** allow passing min and max values ([409295c](https://github.com/algolia/react-instantsearch/commit/409295c)), closes [#858](https://github.com/algolia/react-instantsearch/issues/858)
* **react-native:** make react-instantsearch compatible for native dev (#1573) ([91df45a](https://github.com/algolia/react-instantsearch/commit/91df45a))
* **refinement-list:** Add BEM naming ([b09b830](https://github.com/algolia/react-instantsearch/commit/b09b830))
* **refinementlist:** lets configure showmore feature ([3b8688a](https://github.com/algolia/react-instantsearch/commit/3b8688a))
* **refinementlist:** Move default templates to its own file ([cb6fa16](https://github.com/algolia/react-instantsearch/commit/cb6fa16))
* **refinementList:** Limits improvement ([ebcc8a9](https://github.com/algolia/react-instantsearch/commit/ebcc8a9))
* **RefinementList, connectRefinementList:** allow to search for facet values ([e086a81](https://github.com/algolia/react-instantsearch/commit/e086a81))
* **searchbox:** Make the searchBox BEMish ([db8bd60](https://github.com/algolia/react-instantsearch/commit/db8bd60))
* **searchBox:** ability to be non-instant ([b3ef871](https://github.com/algolia/react-instantsearch/commit/b3ef871)), closes [#458](https://github.com/algolia/react-instantsearch/issues/458)
* **searchBox:** Add `wrapInput` option ([b327dbc](https://github.com/algolia/react-instantsearch/commit/b327dbc))
* **searchBox:** add event handling ([e267ab6](https://github.com/algolia/react-instantsearch/commit/e267ab6)), closes [#2017](https://github.com/algolia/react-instantsearch/issues/2017)
* **searchBox:** add headerFooter decorator to the Component ([5974a88](https://github.com/algolia/react-instantsearch/commit/5974a88))
* **searchBox:** add poweredBy option, disabled by default ([c9da165](https://github.com/algolia/react-instantsearch/commit/c9da165))
* **searchBox:** allow to pass a queryHook ([5786a64](https://github.com/algolia/react-instantsearch/commit/5786a64))
* **SearchBox:** add default width and height to buttons. (#34) ([bcabf9b](https://github.com/algolia/react-instantsearch/commit/bcabf9b))
* **SearchBox:** add role=search to the form (#2046) ([d1e90f3](https://github.com/algolia/react-instantsearch/commit/d1e90f3))
* **SearchBox:** allow custom reset and submit components (#1991) ([cd303d7](https://github.com/algolia/react-instantsearch/commit/cd303d7))
* **slider:** allow overriding css classes from a user stylesheet ([a1e87dd](https://github.com/algolia/react-instantsearch/commit/a1e87dd))
* **slider:** first iteration ([229bb02](https://github.com/algolia/react-instantsearch/commit/229bb02))
* **slider:** second iteration ([885aff6](https://github.com/algolia/react-instantsearch/commit/885aff6))
* **snippet:** add a snippet widget to be able to highlight snippet results (#1797) ([2aecc40](https://github.com/algolia/react-instantsearch/commit/2aecc40))
* **sortBy:** implement default sortBy, remove option (#1549) ([d78f0c0](https://github.com/algolia/react-instantsearch/commit/d78f0c0)), closes [#1529](https://github.com/algolia/react-instantsearch/issues/1529)
* **starRating:** indicate when any refinement has no effect ([c547ae5](https://github.com/algolia/react-instantsearch/commit/c547ae5))
* **stats:** add query variable to the template ([75f457d](https://github.com/algolia/react-instantsearch/commit/75f457d))
* **styling:** better styling API, docs ([b9b6b5d](https://github.com/algolia/react-instantsearch/commit/b9b6b5d))
* **Template:** accepts any parameters and forwards them ([5170f53](https://github.com/algolia/react-instantsearch/commit/5170f53))
* **Template:** allow template functions to return a React element ([0f9296d](https://github.com/algolia/react-instantsearch/commit/0f9296d))
* **Template:** allow template functions to return a React element ([748077d](https://github.com/algolia/react-instantsearch/commit/748077d))
* **templatesConfig:** helpers and options transferred to Template ([456d781](https://github.com/algolia/react-instantsearch/commit/456d781)), closes [#99](https://github.com/algolia/react-instantsearch/issues/99)
* **theme:** Add `searchBox` widget to default theme ([def831f](https://github.com/algolia/react-instantsearch/commit/def831f))
* **theme:** Add debug.css file ([ff8f2dc](https://github.com/algolia/react-instantsearch/commit/ff8f2dc)), closes [#249](https://github.com/algolia/react-instantsearch/issues/249)
* **theme:** add default themes using css-modules ([b6c6b43](https://github.com/algolia/react-instantsearch/commit/b6c6b43))
* **theme:** Move `indexSelector` styling to default.css ([1841ef1](https://github.com/algolia/react-instantsearch/commit/1841ef1))
* **theme:** Move all default css rules to `default.css` ([57c8c65](https://github.com/algolia/react-instantsearch/commit/57c8c65))
* **theme:** move to CSS file and CSS class names only theming (#1632) ([8851e3e](https://github.com/algolia/react-instantsearch/commit/8851e3e)), closes [#1575](https://github.com/algolia/react-instantsearch/issues/1575)
* **toggle:** add headerFooter decorator ([8a70c7d](https://github.com/algolia/react-instantsearch/commit/8a70c7d))
* **toggle:** Adding BEM class naming ([8730c97](https://github.com/algolia/react-instantsearch/commit/8730c97))
* **toggle:** Allow custom on/off values ([9b6c2bf](https://github.com/algolia/react-instantsearch/commit/9b6c2bf)), closes [#409](https://github.com/algolia/react-instantsearch/issues/409)
* **toggle:** Provide a better default widget (#1146) ([d54107e](https://github.com/algolia/react-instantsearch/commit/d54107e)), closes [#1096](https://github.com/algolia/react-instantsearch/issues/1096) [#919](https://github.com/algolia/react-instantsearch/issues/919)
* **transformData:** add to every widget using the Template component ([d080a03](https://github.com/algolia/react-instantsearch/commit/d080a03)), closes [#116](https://github.com/algolia/react-instantsearch/issues/116)
* **transformData:** refinementList + menu implementation ([0a0e36e](https://github.com/algolia/react-instantsearch/commit/0a0e36e))
* **unmount:** clean state if a widget is unmounted except if it is persistent (#1588) ([61d68a0](https://github.com/algolia/react-instantsearch/commit/61d68a0))
* **url-sync:** Add `is_v` version to url ([9f597a0](https://github.com/algolia/react-instantsearch/commit/9f597a0)), closes [#70](https://github.com/algolia/react-instantsearch/issues/70)
* **url-sync:** use the new mapping option ([f869885](https://github.com/algolia/react-instantsearch/commit/f869885)), closes [#838](https://github.com/algolia/react-instantsearch/issues/838)
* **urls:** ability to create an URL from a set of params ([9ca8369](https://github.com/algolia/react-instantsearch/commit/9ca8369)), closes [#372](https://github.com/algolia/react-instantsearch/issues/372)
* **urlSync:** add urlSync widget ([50fc4ce](https://github.com/algolia/react-instantsearch/commit/50fc4ce))
* **urlSync:** allow overriding replaceState(state)/pushState(state) ([989856c](https://github.com/algolia/react-instantsearch/commit/989856c))
* **urlSync:** url generation for widget links. Fix #29 ([23dd505](https://github.com/algolia/react-instantsearch/commit/23dd505)), closes [#29](https://github.com/algolia/react-instantsearch/issues/29)
* **validate-pr:** Allow `docs()` commits to be merged in master ([0abc689](https://github.com/algolia/react-instantsearch/commit/0abc689))
* Switch/Toggle widget ([3b2a450](https://github.com/algolia/react-instantsearch/commit/3b2a450))
* **widget:** add powered by widget (#1425) ([f662362](https://github.com/algolia/react-instantsearch/commit/f662362))
* Use `helpers.formatNumber` syntax instead of `_formatNumber` ([6207514](https://github.com/algolia/react-instantsearch/commit/6207514))
* Warn users if we do not override `helpers` in templates ([a4199a5](https://github.com/algolia/react-instantsearch/commit/a4199a5))
* **widget:** add a new rating range (#1317) ([5f5ff8d](https://github.com/algolia/react-instantsearch/commit/5f5ff8d))
* **widget:** add an input range (#1297) ([6c9c528](https://github.com/algolia/react-instantsearch/commit/6c9c528))
* **widget:** remove loading (#1470) ([005d1f0](https://github.com/algolia/react-instantsearch/commit/005d1f0))
* **widget:** rename rangeRatings to starRatings + design improvements (#1646) ([7446194](https://github.com/algolia/react-instantsearch/commit/7446194))
* **widgets:** add transformItems to be able to sort and filter (#1809) ([ba539f0](https://github.com/algolia/react-instantsearch/commit/ba539f0))
* **widgets:** auto hide some widgets ([187b4bd](https://github.com/algolia/react-instantsearch/commit/187b4bd))
* **widgets:** default design for disabled states (#1929) ([31f010b](https://github.com/algolia/react-instantsearch/commit/31f010b))


### Performance Improvements

* **autoHideContainer:** stop re-creating React components ([8c89862](https://github.com/algolia/react-instantsearch/commit/8c89862))
* **formatting numbers:** stop using a default locale, use the system one ([b056554](https://github.com/algolia/react-instantsearch/commit/b056554))
* **hitsPerPageSelector:** Use the correct lodash function ([be9aea7](https://github.com/algolia/react-instantsearch/commit/be9aea7))
* **linters:** Greatly improve the `npm run lint` task speed ([1ba53b0](https://github.com/algolia/react-instantsearch/commit/1ba53b0))
* **nouislider:** upgrade nouislider, shaves some more ms ([fefbe65](https://github.com/algolia/react-instantsearch/commit/fefbe65))
* **React:** use babel `optimisation` option for React ([95f940c](https://github.com/algolia/react-instantsearch/commit/95f940c))
* **React, widgets:** implement shouldComponentUpdate, reduce bind ([5efaac1](https://github.com/algolia/react-instantsearch/commit/5efaac1))
* **refinementList:** Stop creating URL for hidden refinements. ([2cdd17d](https://github.com/algolia/react-instantsearch/commit/2cdd17d))


### Tests

* **toggle:** second pass at testing toggle ([498bad6](https://github.com/algolia/react-instantsearch/commit/498bad6))
* **toggle:** start implementing toggle tests ([20f755d](https://github.com/algolia/react-instantsearch/commit/20f755d))


### BREAKING CHANGES

* multi-index: * Reseting the pagination should be done at each connector level inside the "refine" function when returning the search state.
* The current page now appears inside the search state when a widget is used
* Query values are part of the items prop of the connectCurrentRefinements connector. Behaviour is unchanged, query will be filtered if clearsQuery prop is false.
* Add the index name to all the current refinements items. (not used by our widgets yet, but available if needed).
* menu,refinementList: Removed from menu and refinementList:
- rootClass => cssClasses.root
- itemCLass => cssClasses.item
- template => templates.item

Added to menu and refinementList:
- cssClasses{root,list,item}
- templates{header,item,footer}
- widget (container) is automatically hidden by default
- hideWhenNoResults=true

This was done to allow more templating solutions like discussed in #101.
* *Hits: itemComponent is now named hitComponent in:
  - Hits
  - connectHit
  - InfiniteHits
  - connectInfiniteHits
* api: - InstantSearch props state and onStateChange are now called searchState and onSearchStateChange
* connectSearchBox: - connectSearchBox now forward the query as props.currentRefinement
like any other connector
* api: - HitsPerPage doesn't accept items with the form: array of number. Only object are allowed (label and value).
* hitsPerPage: - You cannot configure hitsPerPage anymore on: Hits, connectHits,
InfiniteHits, connectInfiniteHits. Please use HitsPage,
connectHitsPerPage or searchParameters option of `<InstantSearch>`
* createConnector: When creating custom connectors, getProps is now named
getProvidedProps
* widget: RangeRatings is now StarRating
* connectHierarchicalMenu: - HierarchicalMenu ais-HierarchicalMenu__itemChildren css class name
is now ais-HierarchicalMenu__itemItems
- connectHierarchicalMenu item.children forwarded prop is now
item.items
* theme: - CSS is no more injected by default, read our styling guide to know how
to load it
- react-themeable, theme={} prop have been removed from the codebase,
the only way to style widgets is now to use CSS class names
* api: - our internal state shape now includes namespacing to avoid id collision. Also some existing keys were renamed:
* searchbox was using 'q' now it uses 'query'
* hitsPerPage was using 'hPP' now it uses 'hitsPerPage'
* pagination and infiniteHits were using 'p' now it uses 'page'
- toggle internal state change from 'on/off' to 'true/false'
For more information about the state shape, please read our documentation.
* api: connectCurrentRefinements forwarded props have changed to provide more power and align with other connectors, read the documentation to get the new structure
* sortBy: sortBy option does not exists anymore. Please use a connector or open a new issue with your usecase for it.
* history: - There's no more built in URL synchronisation
- We now provide the semantics and examples to handle URL sychronisation on your side, giving you full power and understanding. Read how to do it here: https://community.algolia.com/wordpress/installation.html
* guides: urlSync/Thresold should not be use anymore. If the url synchronisation is needed please follow the url-routing section of the advanced topics guide.
* api: - no more translation for count available. If you need a custom markup, please use the connector.
* connector: - loading connector has been removed
* api: - page props inside Pagination is now called currentRefinement
* widgets: - HierarchicalMenu are now using the modifier itemParent instead of item_parent for their classnames
- Add classnames for toggle
- Respect classnames convention for ClearAll

* docs(widgets): add jsdoc to widgets
* connectors: - when using connectors, `value` is now the precomputed value to
refine, to display the corresponding name, use `label`
- when using connectors, `selectedItems` is no more available. Every
`item` now has a `isRefined` property

Basically this should make using connectors a lot easier since the API
is again more consistent between connectors.
* api: - error widget is removed. Please use the createConnector function to do conditional display.
See our "Conditional Display" guide.
* api: - We don't provide a RangeSlider widget anymore. If you need one, you can pick an existing one and use our connectRange connector.
* api: - Reset: renamed to ClearAll
- CurrentFilters : remove the clearAll button. Use the ClearAll widget instead to have the same behavior
- CurrentFilters: renamed to CurrentRefinements
* widget: removed Loading widget
* storybook: removed widgets: RefinementListLinks, MenuSelect, HitsPerPage, SortByLinks
renamed: HitsPerPageSelect to HitsPerPage
* API: The way to access connectors (NameOfWidget.connect)
and default widgets (NameOfWidget) has changed. You need to update
your imports.

Now:

```js
import {InstantSearch, SearchBox, RangeRatings} from 'react-instantsearch/dom';
import {connectSearchBox} from 'react-instantsearch/connectors';
import {createConnector} from 'react-instantsearch';
```

Before:

```js
import {InstantSearch, SearchBox, Range} from 'react-instantsearch/dom';
// use SearchBox.connect
// use Range.Ratings
```
* indexSelector: the `indexSelector` has been renamed to
`sortBySelector`.
* MultiRange: - MultiRange/connectMultiRange: will add a "All" range to allow unselection of range without the usage of CurrentRefinements. This range can be either filtered or ramove via CSS if not needed. The label can be changed by using our translations system.
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
* hierarchicalMenu: Hierarchical menu levels 1 and 2 now have
a margin-left added in the default theme.
* api: use autoHideContainer instead of
hideContainerWhenNoResults
* numerical widgets: the priceRanges and rangeSlider widgets are now using `attributeName` instead of `facetName`.
* template: some extra divs have been removed and my break your CSS rules.
* themes: no more dist/themes/ directory.
* priceRanges: `ais-price-ranges--range` are now named
`ais-price-ranges--item` and are wrapped in
a `ais-price-ranges--list`.

I've moved the bottom form into it's own PriceRangesForm component,
along with its own tests. I've fixed a minor typo where the component
was internally named PriceRange (without the final __s__).

I factorize some logic form the render in individual methods and
manage to individually test them. This was not an easy task. I had to
mock the default `render` (so it does nothing) before instanciating
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
* priceRanges: the `input-group` modifier has been renamed to `form`
* autohide: Widget attribute is now named
`hideContainerWhenNoResults` instead of `hideWhenNoResults` to be more
explicit on what it is really doing.

Also internally renamed the `autoHide` decorator to
`autoHideContainer`
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
* toggle: toggle widget now expose {{name}} instead of label
* toggle: toggle widget now exposes templates.item instead of
templates.body (consistency)
* toggle: (templates.body -> templates.item for the toggle widget)
* searchbox: The `searchBox` widget now expect
a `cssClasses.{input, poweredBy}`
* bem: We now use a `span.ais-stats--time` instead of
a `small` tag in the stats widget.
* bem: We now use `cssClasses.select` and
`cssClasses.option` instead of `cssClass` for the index-selector
widget.
* toggle: - toggle: removed template
* searchBox: - removed: inputClass
* requirements: `facetName` is now named `attributeName` in all
widgets.

- Added a "requirement" button to all code examples
- Refactored the way switching from one button to another is working
- `s/facetName/attributeName/`
- Fixed a few typos in the documentation
- Updated BEM example



<a name="4.0.0-beta.1"></a>
# [4.0.0-beta.1](https://github.com/algolia/instantsearch.js/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2017-04-03)


### Bug Fixes

* **SFFV:** fix wrong query behaviour with slow network (#2086) ([c251e8f](https://github.com/algolia/instantsearch.js/commit/c251e8f)), closes [#2086](https://github.com/algolia/instantsearch.js/issues/2086)



<a name="4.0.0-beta.0"></a>
# [4.0.0-beta.0](https://github.com/algolia/instantsearch.js/compare/v3.3.0...v4.0.0-beta.0) (2017-03-28)


### Features

* **multi-index:** ease multi index and auto complete ([09a4e1d](https://github.com/algolia/instantsearch.js/commit/09a4e1d))


### BREAKING CHANGES

* multi-index: * Reseting the pagination should be done at each connector level inside the "refine" function when returning the search state.
* The current page now appears inside the search state when a widget is used
* Query values are part of the items prop of the connectCurrentRefinements connector. Behaviour is unchanged, query will be filtered if clearsQuery prop is false.
* Add the index name to all the current refinements items. (not used by our widgets yet, but available if needed).



<a name="3.3.0"></a>
# [3.3.0](https://github.com/algolia/instantsearch.js/compare/v3.2.2-beta0...v3.3.0) (2017-03-22)


### Bug Fixes

* **example:** Fix access to props in react-router example ([1417d6f](https://github.com/algolia/instantsearch.js/commit/1417d6f))



<a name="3.2.2-beta0"></a>
## [3.2.2-beta0](https://github.com/algolia/instantsearch.js/compare/v3.2.1...v3.2.2-beta0) (2017-03-20)


### Bug Fixes

* **InfiniteHits:** provide translation key for `Load More` (#2048) ([6130bf2](https://github.com/algolia/instantsearch.js/commit/6130bf2))
* **SearchBox:** better mobile behaviour by default ([ea968b3](https://github.com/algolia/instantsearch.js/commit/ea968b3))
* **example:** link to instantsearch/react (#2007) ([5e674cd](https://github.com/algolia/instantsearch.js/commit/5e674cd))
* **recipes:** react router v4 ([de673bf](https://github.com/algolia/instantsearch.js/commit/de673bf))


### Features

* **SearchBox:** add role=search to the form (#2046) ([d1e90f3](https://github.com/algolia/instantsearch.js/commit/d1e90f3))
* **SearchBox:** allow custom reset and submit components (#1991) ([cd303d7](https://github.com/algolia/instantsearch.js/commit/cd303d7))
* **searchBox:** add event handling ([e267ab6](https://github.com/algolia/instantsearch.js/commit/e267ab6)), closes [#2017](https://github.com/algolia/instantsearch.js/issues/2017)



<a name="3.2.1"></a>
## [3.2.1](https://github.com/algolia/instantsearch.js/compare/v3.2.0...v3.2.1) (2017-02-22)


### Bug Fixes

* **umd:** Add connectors to UMD build (#1988) ([23ac5e6](https://github.com/algolia/instantsearch.js/commit/23ac5e6)), closes [#1987](https://github.com/algolia/instantsearch.js/issues/1987)



<a name="3.2.0"></a>
# [3.2.0](https://github.com/algolia/instantsearch.js/compare/v3.1.0...v3.2.0) (2017-02-15)


### Bug Fixes

* **Configure:** use props a unique source of truth (#1967) ([9d53d86](https://github.com/algolia/instantsearch.js/commit/9d53d86))
* **SearchBox:** Safari can only have <use> with xlinkHref (#1970) ([7ab00bd](https://github.com/algolia/instantsearch.js/commit/7ab00bd)), closes [#1968](https://github.com/algolia/instantsearch.js/issues/1968)


### Features

* **MultiRange:** add an all range (#1959) ([a3dc950](https://github.com/algolia/instantsearch.js/commit/a3dc950))


### BREAKING CHANGES

* MultiRange: - MultiRange/connectMultiRange: will add a "All" range to allow unselection of range without the usage of CurrentRefinements. This range can be either filtered or ramove via CSS if not needed. The label can be changed by using our translations system.



<a name="3.1.0"></a>
# [3.1.0](https://github.com/algolia/instantsearch.js/compare/v3.0.0...v3.1.0) (2017-02-08)


### Bug Fixes

* **Configure:** call onSearchStateChange when props are updated (#1953) ([7e151db](https://github.com/algolia/instantsearch.js/commit/7e151db)), closes [#1950](https://github.com/algolia/instantsearch.js/issues/1950)
* **Configure:** trigger onSearchStateChange with the right data ([11e5af8](https://github.com/algolia/instantsearch.js/commit/11e5af8))
* **createConnector:** updates with latest props on state change (#1951) ([cd3a82c](https://github.com/algolia/instantsearch.js/commit/cd3a82c))


### Features

* **ClearAll:** add withQuery to also clear the search query (#1958) ([c0e695b](https://github.com/algolia/instantsearch.js/commit/c0e695b))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/algolia/instantsearch.js/compare/v2.2.5...v3.0.0) (2017-02-06)


### Bug Fixes

* ***List:** disable shortcuts in *List SearchBoxes (#1921) ([51a76ae](https://github.com/algolia/instantsearch.js/commit/51a76ae)), closes [#1920](https://github.com/algolia/instantsearch.js/issues/1920)
* **Configure:** add configure parameters in search state (#1935) ([0971330](https://github.com/algolia/instantsearch.js/commit/0971330)), closes [#1863](https://github.com/algolia/instantsearch.js/issues/1863)
* **Hits:** limit the hitComponent to be only a function (#1912) ([b3c9578](https://github.com/algolia/instantsearch.js/commit/b3c9578))
* **Pagination:** fix and indicate when pagination is disabled ([5f20199](https://github.com/algolia/instantsearch.js/commit/5f20199)), closes [#1938](https://github.com/algolia/instantsearch.js/issues/1938)
* **StarRating:** usage with filters (#1933) ([667e9d5](https://github.com/algolia/instantsearch.js/commit/667e9d5))
* **withSearchBox:** keep displaying searchBox when no items found (#1930) ([30de4cd](https://github.com/algolia/instantsearch.js/commit/30de4cd))


### Features

* **MultiRange:** indicate if a range has no refinements (#1926) ([80b6450](https://github.com/algolia/instantsearch.js/commit/80b6450))
* **panel:** add a panel widget (#1889) ([594e1a1](https://github.com/algolia/instantsearch.js/commit/594e1a1))
* **starRating:** indicate when any refinement has no effect ([c547ae5](https://github.com/algolia/instantsearch.js/commit/c547ae5))
* **widgets:** default design for disabled states (#1929) ([31f010b](https://github.com/algolia/instantsearch.js/commit/31f010b))

### Migration guide

The migration to V3.0.0 should be safe and you should do it.

There are two breaking changes that you will need to handle in your codebase:
- Anytime you are using a connector, when there are no more items in it or no more hits, we will still call your Component. Thus you will have to handle cases like dealing with empty arrays and decide if you want to unmount or hide the widget.
- Anytime you are using a widget, when there are no more items in it or no more hits, we will still display the widget. You can then decide to hide it with CSS.

<a name="2.2.5"></a>
## [2.2.5](https://github.com/algolia/instantsearch.js/compare/v2.2.4...v2.2.5) (2017-01-23)


### Bug Fixes

* **currentRefinements:** make removing a toggle refinement work  ([8995e64](https://github.com/algolia/instantsearch.js/commit/8995e64))



<a name="2.2.4"></a>
## [2.2.4](https://github.com/algolia/instantsearch.js/compare/v2.2.3...v2.2.4) (2017-01-20)


### Bug Fixes

* **publish:** publish react-instantsearch/dist instead of root (#1884) ([64414e0](https://github.com/algolia/instantsearch.js/commit/64414e0))



<a name="2.2.3"></a>
## [2.2.3](https://github.com/algolia/instantsearch.js/compare/v2.2.2...v2.2.3) (2017-01-20)


### Bug Fixes

* **SFFV:** translations for searchbox were not applied (#1879) ([e9b4ee1](https://github.com/algolia/instantsearch.js/commit/e9b4ee1))



<a name="2.2.2"></a>
## [2.2.2](https://github.com/algolia/instantsearch.js/compare/v2.2.1...v2.2.2) (2017-01-18)


### Bug Fixes

* **react-router:** search was triggered two many times (#1840) ([25e9db5](https://github.com/algolia/instantsearch.js/commit/25e9db5))
* **SFFV:** empty query triggered a new SFFV (#1875) ([6c8259a](https://github.com/algolia/instantsearch.js/commit/6c8259a))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/algolia/instantsearch.js/compare/v2.2.0...v2.2.1) (2017-01-18)


### Bug Fixes

* **createInstantsearch:** fix missing props (#1867) ([8d319b5](https://github.com/algolia/instantsearch.js/commit/8d319b5)), closes [#1867](https://github.com/algolia/instantsearch.js/issues/1867)



<a name="2.2.0"></a>
# [2.2.0](https://github.com/algolia/instantsearch.js/compare/v2.1.0...v2.2.0) (2017-01-17)


### Bug Fixes

* **clear:** clearing wasn't working with too+ same type facets selected (#1820) ([a9a2364](https://github.com/algolia/instantsearch.js/commit/a9a2364))
* **connectSearchBox:** handle `defaultRefinement` (#1829) ([7a730e2](https://github.com/algolia/instantsearch.js/commit/7a730e2)), closes [#1826](https://github.com/algolia/instantsearch.js/issues/1826)
* **Instantsearch:** Update all props on InstantSearch (#1828) ([2ed9b49](https://github.com/algolia/instantsearch.js/commit/2ed9b49))
* **InstantSearch:** add specific `react-instantsearch ${version}` agent (#1844) ([a1113bc](https://github.com/algolia/instantsearch.js/commit/a1113bc))
* **SFFV:** correct propTypes and add missing default values (#1845) ([a4c1b31](https://github.com/algolia/instantsearch.js/commit/a4c1b31))
* **test:** add missing Snippet and Highliter snapshot ([4accce5](https://github.com/algolia/instantsearch.js/commit/4accce5))
* **widgets:** replace setImmediate use with Promise use when update is needed (#1811) ([17e2497](https://github.com/algolia/instantsearch.js/commit/17e2497))


### Features

* **Menu, connectMenu:** add search for facet values (#1822) ([a6c513e](https://github.com/algolia/instantsearch.js/commit/a6c513e))
* **snippet:** add a snippet widget to be able to highlight snippet results (#1797) ([2aecc40](https://github.com/algolia/instantsearch.js/commit/2aecc40))
* **widgets:** add transformItems to be able to sort and filter (#1809) ([ba539f0](https://github.com/algolia/instantsearch.js/commit/ba539f0))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/algolia/instantsearch.js/compare/v2.0.1...v2.1.0) (2017-01-04)


### Bug Fixes

* **createInstantSearchManager:** drop outdated response (#1765) ([76c5312](https://github.com/algolia/instantsearch.js/commit/76c5312))
* **highlight:** highlight should work even if the attribute is missing (#1791) ([5b79b15](https://github.com/algolia/instantsearch.js/commit/5b79b15)), closes [#1790](https://github.com/algolia/instantsearch.js/issues/1790)
* **InfiniteHits:** better classname to loadmore btn (#1789) ([ad2ded3](https://github.com/algolia/instantsearch.js/commit/ad2ded3))
* **starRatings:** click on selected range doesn't unselect it (#1766) ([beacc72](https://github.com/algolia/instantsearch.js/commit/beacc72))
* **website:** broken demo links (#1802) ([0abe2f5](https://github.com/algolia/instantsearch.js/commit/0abe2f5))
* **widgets:** add 300px width for the default SearchBox (#1803) ([bf5d791](https://github.com/algolia/instantsearch.js/commit/bf5d791))


### Features

* **InfiniteHits:** Add class to load more button (#1787) ([416febd](https://github.com/algolia/instantsearch.js/commit/416febd))
* **RefinementList, connectRefinementList:** allow to search for facet values ([e086a81](https://github.com/algolia/instantsearch.js/commit/e086a81))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/algolia/instantsearch.js/compare/v2.0.0...v2.0.1) (2016-12-15)


### Bug Fixes

* **connectRange:** when unfinite numbers are passed throw ([75bec0d](https://github.com/algolia/instantsearch.js/commit/75bec0d))
* **react-native:** use View as a container for react-native (#1729) ([5b76f75](https://github.com/algolia/instantsearch.js/commit/5b76f75)), closes [#1730](https://github.com/algolia/instantsearch.js/issues/1730)
* **SearchBox:** autocomplete was not disabled by default (#1742) ([bc76618](https://github.com/algolia/instantsearch.js/commit/bc76618))
* **starRating:** call createURL with the right interface (min/max) (#1747) ([f9ab9b6](https://github.com/algolia/instantsearch.js/commit/f9ab9b6))



<a name="2.0.0"></a>
## [2.0.0](https://github.com/algolia/instantsearch.js/compare/v2.0.0...v2.0.0) (2016-12-08)

First release of `react-instantsearch`
