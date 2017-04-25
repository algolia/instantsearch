<a name="4.0.0-beta.4"></a>
# [4.0.0-beta.4](https://github.com/algolia/react-instantsearch/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2017-04-25)


### Bug Fixes

* **MultIndex:** no need to nest hits, if those are from main index. (#56) ([86e0bd7](https://github.com/algolia/react-instantsearch/commit/86e0bd7))


### Features

* **MultiIndex:** remove the need for virtual hits when using connectAutoComplete (#45) ([7549019](https://github.com/algolia/react-instantsearch/commit/7549019))



<a name="4.0.0-beta.3"></a>
# [4.0.0-beta.3](https://github.com/algolia/react-instantsearch/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2017-04-21)


### Bug Fixes

* replace usage of Object.values (#47) ([4c79e3e](https://github.com/algolia/react-instantsearch/commit/4c79e3e))



<a name="4.0.0-beta.2"></a>
# [4.0.0-beta.2](https://github.com/algolia/react-instantsearch/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2017-04-18)


### Bug Fixes

* **InstantSearch:** dont fire request/onsearchStateChange when unmounting (#26) ([9a1487a](https://github.com/algolia/react-instantsearch/commit/9a1487a))
* **MultiIndex:** derived helper were using main index specifics params (#36) ([991fea6](https://github.com/algolia/react-instantsearch/commit/991fea6))
* **MultiIndex:** revert breaking change if no multiple index (#32) ([44f7de0](https://github.com/algolia/react-instantsearch/commit/44f7de0))
* **util:** remove empty key was removing non object key (#29) ([9f795c7](https://github.com/algolia/react-instantsearch/commit/9f795c7))


### Features

* **Highlighter:** allow rendering to custom tag (#11) ([52a1212](https://github.com/algolia/react-instantsearch/commit/52a1212))
* **SearchBox:** add default width and height to buttons. (#34) ([bcabf9b](https://github.com/algolia/react-instantsearch/commit/bcabf9b))



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
