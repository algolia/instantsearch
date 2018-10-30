<a name="5.3.2"></a>
## [5.3.2](https://github.com/algolia/react-instantsearch/compare/v5.3.1...v5.3.2) (2018-10-30)


### Bug Fixes

* **sffv:** clamp maxFacetHits to the allowed range ([#1696](https://github.com/algolia/react-instantsearch/issues/1696)) ([83ce245](https://github.com/algolia/react-instantsearch/commit/83ce245))



<a name="5.3.1"></a>
## [5.3.1](https://github.com/algolia/react-instantsearch/compare/v5.3.0...v5.3.1) (2018-09-26)


### Bug Fixes

* **connector:** ensure canRefine is computed on the transformed items ([#1568](https://github.com/algolia/react-instantsearch/pull/1568)) ([c95384f](https://github.com/algolia/react-instantsearch/commit/c95384f))
* **toggle:** ensure facet is present ([#1613](https://github.com/algolia/react-instantsearch/issues/1613)) ([e914ff6](https://github.com/algolia/react-instantsearch/commit/e914ff6))



<a name="5.3.0"></a>
# [5.3.0](https://github.com/algolia/react-instantsearch/compare/v5.2.3...v5.3.0) (2018-09-24)


### Bug Fixes

* **SSR:** bind getSearchParmaters to the component instance ([f34cb3d](https://github.com/algolia/react-instantsearch/commit/f34cb3d))
* **GoogleMapsLoader:** pick google maps version ([#1540](https://github.com/algolia/react-instantsearch/issues/1540)) ([b14efcf](https://github.com/algolia/react-instantsearch/commit/b14efcf))


### Features

* **connectToggleRefinement:** implement canRefine & count ([#1588](https://github.com/algolia/react-instantsearch/issues/1588)) ([40672dd](https://github.com/algolia/react-instantsearch/commit/40672dd))



<a name="5.2.3"></a>
## [5.2.3](https://github.com/algolia/react-instantsearch/compare/v5.2.2...v5.2.3) (2018-08-16)


### Bug Fixes

* Allow object as type for Root (closes [#1446](https://github.com/algolia/react-instantsearch/issues/1446)) ([#1461](https://github.com/algolia/react-instantsearch/issues/1461)) ([7c2317b](https://github.com/algolia/react-instantsearch/commit/7c2317b))
* **List:** render children list only when required ([#1472](https://github.com/algolia/react-instantsearch/issues/1472)) ([9eb2cbb](https://github.com/algolia/react-instantsearch/commit/9eb2cbb)), closes [#1459](https://github.com/algolia/react-instantsearch/issues/1459)



<a name="5.2.2"></a>
## [5.2.2](https://github.com/algolia/react-instantsearch/compare/v5.2.1...v5.2.2) (2018-07-16)


Publish the previous version on `stable`.



<a name="5.2.1"></a>
## [5.2.1](https://github.com/algolia/react-instantsearch/compare/v5.2.0...v5.2.1) (2018-07-16)


### Bug Fixes

* **GoogleMapsLoader:** inline the import to scriptjs ([#1427](https://github.com/algolia/react-instantsearch/issues/1427)) ([8019416](https://github.com/algolia/react-instantsearch/commit/8019416))



<a name="5.2.0"></a>
# [5.2.0](https://github.com/algolia/react-instantsearch/compare/v5.2.0-beta.2...v5.2.0) (2018-07-04)


### Bug Fixes

* **translatable:** avoid create a new function on every render ([#1383](https://github.com/algolia/react-instantsearch/issues/1383)) ([1285b3b](https://github.com/algolia/react-instantsearch/commit/1285b3b))


### Features

* **core:** export translatable ([#1351](https://github.com/algolia/react-instantsearch/issues/1351)) ([6d5a89d](https://github.com/algolia/react-instantsearch/commit/6d5a89d))
* **maps:** add connector & widget ([#1171](https://github.com/algolia/react-instantsearch/issues/1171)) ([16e288a](https://github.com/algolia/react-instantsearch/commit/16e288a))



<a name="5.2.0-beta.2"></a>
# [5.2.0-beta.2](https://github.com/algolia/react-instantsearch/compare/v5.2.0-beta.1...v5.2.0-beta.2) (2018-06-19)


### Features

* export highlight tags from DOM / native ([#1342](https://github.com/algolia/react-instantsearch/issues/1342)) ([28a699e](https://github.com/algolia/react-instantsearch/commit/28a699e))
* **createInstantSearch:** enable _useRequestCache ([#1346](https://github.com/algolia/react-instantsearch/issues/1346)) ([f772600](https://github.com/algolia/react-instantsearch/commit/f772600))
* **dom:** export create class name ([#1348](https://github.com/algolia/react-instantsearch/issues/1348)) ([9017468](https://github.com/algolia/react-instantsearch/commit/9017468))



<a name="5.2.0-beta.1"></a>
# [5.2.0-beta.1](https://github.com/algolia/react-instantsearch/compare/v5.2.0-beta.0...v5.2.0-beta.1) (2018-06-04)


### Bug Fixes

* **dom:** publish server file ([#1305](https://github.com/algolia/react-instantsearch/issues/1305)) ([bd79693](https://github.com/algolia/react-instantsearch/commit/bd79693))



<a name="5.2.0-beta.0"></a>
# [5.2.0-beta.0](https://github.com/algolia/react-instantsearch/compare/v5.1.0...v5.2.0-beta.0) (2018-06-04)


This new version introduce a complete revamp of the package structure, but it should be completely transparent for the users.

If you have any troubles with this version please open a issue on [Github](https://github.com/algolia/react-instantsearch/issues/new), thanks!



<a name="5.1.0"></a>
# [5.1.0](https://github.com/algolia/react-instantsearch/compare/v5.0.3...v5.1.0) (2018-05-28)


### Bug Fixes

* **connectInfiniteHits:** always set a value for previous page ([#1195](https://github.com/algolia/react-instantsearch/issues/1195)) ([4c218d5](https://github.com/algolia/react-instantsearch/commit/4c218d5))
* **indexUtils:** avoid throw an error on cleanUp multi indices ([#1265](https://github.com/algolia/react-instantsearch/issues/1265)) ([12f5ace](https://github.com/algolia/react-instantsearch/commit/12f5ace))


### Features

* **searchClient:** Add support for custom Search Clients ([#1216](https://github.com/algolia/react-instantsearch/issues/1216)) ([174cc28](https://github.com/algolia/react-instantsearch/commit/174cc28))



<a name="5.0.3"></a>
## [5.0.3](https://github.com/algolia/react-instantsearch/compare/v5.0.2...v5.0.3) (2018-04-03)


### Bug Fixes

* revert dependencies as devDependencies ([#1135](https://github.com/algolia/react-instantsearch/issues/1135)) ([6b627bb](https://github.com/algolia/react-instantsearch/commit/6b627bb))



<a name="5.0.2"></a>
## [5.0.2](https://github.com/algolia/react-instantsearch/compare/v5.0.1...v5.0.2) (2018-04-03)


### Bug Fixes

* use lodash version of unsupported Array.{fill, find} ([#1118](https://github.com/algolia/react-instantsearch/issues/1118)) ([ea7bf42](https://github.com/algolia/react-instantsearch/commit/ea7bf42))



<a name="5.0.1"></a>
## [5.0.1](https://github.com/algolia/react-instantsearch/compare/v5.0.0...v5.0.1) (2018-03-12)


### Bug Fixes

* **connectInfiniteHits:** always provide an array for hits ([#1064](https://github.com/algolia/react-instantsearch/issues/1064)) ([c75e38b](https://github.com/algolia/react-instantsearch/commit/c75e38b))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/algolia/react-instantsearch/compare/v4.5.2...v5.0.0) (2018-03-06)


This new version introduce a complete revamp of the naming and the HTML output of most widgets. The goal of this release is to provide improved semantics to our users.

This release also introduces a new CSS naming convention which will be reused across all InstantSearch libraries. This will enable the possibility to develop cross-libraries CSS themes easily.

You can find all the informations for the migration [in our documentation](https://community.algolia.com/react-instantsearch/guide/Migration_guide_v5.html).



<a name="4.5.2"></a>
## [4.5.2](https://github.com/algolia/react-instantsearch/compare/v4.5.1...v4.5.2) (2018-03-06)


### Bug Fixes

* **connectRange:** update default refinement propTypes ([#978](https://github.com/algolia/react-instantsearch/issues/978)) ([c065fb1](https://github.com/algolia/react-instantsearch/commit/c065fb1))
* **IndexUtils:** avoid throw an error when cleanUp multi index ([#1019](https://github.com/algolia/react-instantsearch/issues/1019)) ([865a3c3](https://github.com/algolia/react-instantsearch/commit/865a3c3))
* **SearchBox:** avoid to bind click on reset button ([#979](https://github.com/algolia/react-instantsearch/issues/979)) ([ea3063a](https://github.com/algolia/react-instantsearch/commit/ea3063a))



<a name="5.0.0-beta.1"></a>
# [5.0.0-beta.1](https://github.com/algolia/react-instantsearch/compare/v5.0.0-beta.0...v5.0.0-beta.1) (2018-02-06)


Apply features & bug fixes from [v4.5.0](#450-2018-02-06) & [v4.5.1](#451-2018-02-06) on the v5.

See their CHANGELOG for more details.



<a name="4.5.1"></a>
## [4.5.1](https://github.com/algolia/react-instantsearch/compare/v4.5.0...v4.5.1) (2018-02-06)


### Bug Fixes

* **StarRating:** move to 1 based instead of 0 ([#949](https://github.com/algolia/react-instantsearch/issues/949)) ([eb0152d](https://github.com/algolia/react-instantsearch/commit/eb0152d))



<a name="4.5.0"></a>
# [4.5.0](https://github.com/algolia/react-instantsearch/compare/v4.4.2...v4.5.0) (2018-02-06)


### Bug Fixes

* **connectRange:** use the same behaviour for currentRefinement in getMetadata ([#923](https://github.com/algolia/react-instantsearch/issues/923)) ([08917b6](https://github.com/algolia/react-instantsearch/commit/08917b6))
* **connectToggle:** use currentRefinement in metadata instead of the label ([#909](https://github.com/algolia/react-instantsearch/issues/909)) ([89cae2b](https://github.com/algolia/react-instantsearch/commit/89cae2b))
* **StarRatings:** always show the stars below ([#929](https://github.com/algolia/react-instantsearch/issues/929)) ([22bf93a](https://github.com/algolia/react-instantsearch/commit/22bf93a))


### Features

* **connectStateResults:** expose isSearchStalled ([#933](https://github.com/algolia/react-instantsearch/issues/933)) ([f45ba27](https://github.com/algolia/react-instantsearch/commit/f45ba27))


<a name="5.0.0-beta.0"></a>
# [5.0.0-beta.0](https://github.com/algolia/react-instantsearch/compare/v4.4.2...v5.0.0-beta.0) (2018-01-30)


This new version introduce a complete revamp of the naming and the HTML output of most widgets. The goal of this release is to provide improved semantics to our users.

This release also introduces a new CSS naming convention which will be reused across all InstantSearch libraries. This will enable the possibility to develop cross-libraries CSS themes easily.

You can find all the informations for the migration [in our documentation](https://community.algolia.com/react-instantsearch/guide/Migration_guide_v5.html).



<a name="4.4.2"></a>
## [4.4.2](https://github.com/algolia/react-instantsearch/compare/v4.4.1...v4.4.2) (2018-01-24)


### Bug Fixes

* **currentRefinements:** give access to id and index from transformItems for deduplication ([#830](https://github.com/algolia/react-instantsearch/issues/830)) ([316b8f5](https://github.com/algolia/react-instantsearch/commit/316b8f5))
* pass maxFacetHits to SFFV ([#863](https://github.com/algolia/react-instantsearch/issues/863)) ([de23a46](https://github.com/algolia/react-instantsearch/commit/de23a46))



<a name="4.4.1"></a>
## [4.4.1](https://github.com/algolia/react-instantsearch/compare/v4.4.0...v4.4.1) (2018-01-09)


### Bug Fixes

* **SearchBox**: clear SearchBox without search as you type ([#802](https://github.com/algolia/react-instantsearch/issues/802)) ([c49b2b6](https://github.com/algolia/react-instantsearch/commit/c49b2b6))
* **connectRange:** check if facet exist before access ([#797](https://github.com/algolia/react-instantsearch/issues/797)) ([6520760](https://github.com/algolia/react-instantsearch/commit/6520760))
* **stories:** avoid to use linear-background it breaks Argos every time ([#804](https://github.com/algolia/react-instantsearch/issues/804)) ([0beded7](https://github.com/algolia/react-instantsearch/commit/0beded7))
* **stories:** limit hits per page on Index ([#806](https://github.com/algolia/react-instantsearch/issues/806)) ([6eb14d3](https://github.com/algolia/react-instantsearch/commit/6eb14d3))


### Features

* **Index:** allow custom root ([#792](https://github.com/algolia/react-instantsearch/issues/792)) ([d793b0a](https://github.com/algolia/react-instantsearch/commit/d793b0a))



<a name="4.4.0"></a>
# [4.4.0](https://github.com/algolia/react-instantsearch/compare/v4.3.0...v4.4.0) (2018-01-03)


### Bug Fixes

* **createInstantSearch:** remove the client from the Snapshot ([#749](https://github.com/algolia/react-instantsearch/issues/749)) ([700d8f4](https://github.com/algolia/react-instantsearch/commit/700d8f4))
* refresh cache memory leak example ([#784](https://github.com/algolia/react-instantsearch/issues/784)) ([cf228ac](https://github.com/algolia/react-instantsearch/commit/cf228ac))
* **stories:** rename InstantSearch to `<InstantSearch>` ([#789](https://github.com/algolia/react-instantsearch/issues/789)) ([05efda5](https://github.com/algolia/react-instantsearch/commit/05efda5))


### Features

* InstantSearch root props ([#770](https://github.com/algolia/react-instantsearch/issues/770)) ([2d458f8](https://github.com/algolia/react-instantsearch/commit/2d458f8))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/algolia/react-instantsearch/compare/v4.3.0-beta.0...v4.3.0) (2017-12-20)


### Bug Fixes

* reset page with multi index ([#665](https://github.com/algolia/react-instantsearch/issues/665)) ([865b7dc](https://github.com/algolia/react-instantsearch/commit/865b7dc))
* track all index in the manager ([#660](https://github.com/algolia/react-instantsearch/issues/660)) ([793502b](https://github.com/algolia/react-instantsearch/commit/793502b))


### Features

* **SearchBox:** provide a loading indicator ([#544](https://github.com/algolia/react-instantsearch/issues/544)) ([189659e](https://github.com/algolia/react-instantsearch/commit/189659e))
* **Highlight:** support array of strings ([#715](https://github.com/algolia/react-instantsearch/issues/715)) ([8e93c6a](https://github.com/algolia/react-instantsearch/commit/8e93c6a))



<a name="4.3.0-beta.0"></a>
# [4.3.0-beta.0](https://github.com/algolia/react-instantsearch/compare/v4.2.0...v4.3.0-beta.0) (2017-11-27)


### Bug Fixes

* **babelrc:** add a key for each env development, production, es ([#547](https://github.com/algolia/react-instantsearch/issues/547)) ([fa9528d](https://github.com/algolia/react-instantsearch/commit/fa9528d))
* **localizecount:** allow localized string for count in MenuSelect ([#657](https://github.com/algolia/react-instantsearch/issues/657)) ([67ebd34](https://github.com/algolia/react-instantsearch/commit/67ebd34))
* **react-router-example:** Properly update search query when using browser navigation ([#604](https://github.com/algolia/react-instantsearch/issues/604)) ([9ee6600](https://github.com/algolia/react-instantsearch/commit/9ee6600))


### Features

* **refreshcache:** add prop refresh to InstantSearch instance ([#619](https://github.com/algolia/react-instantsearch/issues/619)) ([19f6de0](https://github.com/algolia/react-instantsearch/commit/19f6de0))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/algolia/react-instantsearch/compare/v4.1.3...v4.2.0) (2017-11-02)


### Bug Fixes

* **connectRange:** handle boundaries on first call ([9f14dc0](https://github.com/algolia/react-instantsearch/commit/9f14dc0))
* **connectRange:** use refine instead of cleanUp in metadata ([#526](https://github.com/algolia/react-instantsearch/issues/526)) ([1861235](https://github.com/algolia/react-instantsearch/commit/1861235))
* **hierarchicaMenu:** allow sorting and using limit ([fe178ed](https://github.com/algolia/react-instantsearch/commit/fe178ed)), closes [#92](https://github.com/algolia/react-instantsearch/issues/92)
* **InfiniteHits:** add disabled style to the LoadMore button ([#477](https://github.com/algolia/react-instantsearch/issues/477)) ([faba1ad](https://github.com/algolia/react-instantsearch/commit/faba1ad))
* **Range:** handle float, allow reset and respect boundaries ([75969b8](https://github.com/algolia/react-instantsearch/commit/75969b8))
* **RangeInput:** fix compatibility with React 16 & Panel ([3f218db](https://github.com/algolia/react-instantsearch/commit/3f218db))
* **searchbox:** add maxlength 512 ([#542](https://github.com/algolia/react-instantsearch/issues/542)) ([5bd4033](https://github.com/algolia/react-instantsearch/commit/5bd4033)), closes [#510](https://github.com/algolia/react-instantsearch/issues/510)


### Features

* **MenuSelect:** add component and connector ([cc6e0d7](https://github.com/algolia/react-instantsearch/commit/cc6e0d7))



<a name="4.1.3"></a>
## [4.1.3](https://github.com/algolia/react-instantsearch/compare/v4.1.2...v4.1.3) (2017-10-09)


### Bug Fixes

* **List:** remove React16 warning ([#442](https://github.com/algolia/react-instantsearch/issues/442)) ([8d6cf18](https://github.com/algolia/react-instantsearch/commit/8d6cf18))


### Features

* **connectStateResults:** add component props ([#434](https://github.com/algolia/react-instantsearch/issues/434)) ([c629b97](https://github.com/algolia/react-instantsearch/commit/c629b97))



<a name="4.1.2"></a>
## [4.1.2](https://github.com/algolia/react-instantsearch/compare/v4.1.1...v4.1.2) (2017-09-26)


### Features

* **Conditional:** add connectStateResults connector ([#357](https://github.com/algolia/react-instantsearch/issues/357)) ([462df5f](https://github.com/algolia/react-instantsearch/commit/462df5f))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/algolia/react-instantsearch/compare/v4.1.0...v4.1.1) (2017-09-13)


### Bug Fixes

* **MultiIndex:** reset page to 1 when share widgets refine (#312) ([c85a7bf](https://github.com/algolia/react-instantsearch/commit/c85a7bf))
* **MultiIndex:** Trigger new search when `<Index>` props are updated (#318) ([bb11965](https://github.com/algolia/react-instantsearch/commit/bb11965))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/algolia/react-instantsearch/compare/v4.1.0-beta.5...v4.1.0) (2017-08-28)


### Bug Fixes

* **Highlighting:** revert breaking change (#245) ([045ee06](https://github.com/algolia/react-instantsearch/commit/045ee06))
* **List:** adds support for any type of renderable element (#266) ([d848bb6](https://github.com/algolia/react-instantsearch/commit/d848bb6))
* **Pagination:** fixed the offset ([3c0fff2](https://github.com/algolia/react-instantsearch/commit/3c0fff2))
* **PoweredBy:** aria-* tags are not camelcased (#261) ([dc4a5bb](https://github.com/algolia/react-instantsearch/commit/dc4a5bb))



<a name="4.1.0-beta.5"></a>
# [4.1.0-beta.5](https://github.com/algolia/react-instantsearch/compare/v4.1.0-beta.4...v4.1.0-beta.5) (2017-08-08)


### Bug Fixes

* **SSR:** clean SP before rendering agan (#238) ([e765886](https://github.com/algolia/react-instantsearch/commit/e765886))


### Features

* **Breadcrumb:** add a new widget & connector (#228) ([7f8f3ae](https://github.com/algolia/react-instantsearch/commit/7f8f3ae))



<a name="4.1.0-beta.4"></a>
# [4.1.0-beta.4](https://github.com/algolia/react-instantsearch/compare/v4.1.0-beta.3...v4.1.0-beta.4) (2017-08-03)


### Bug Fixes

* **deps:** Update dependency lint-staged to version ^4.0.0 (#201) ([6867a1b](https://github.com/algolia/react-instantsearch/commit/6867a1b))
* **nextjs/ssr:** parse `params.asPath` (#189) ([ae17da0](https://github.com/algolia/react-instantsearch/commit/ae17da0))
* **PoweredBy:** add a label to the Algolia logo (#216) ([cd235bd](https://github.com/algolia/react-instantsearch/commit/cd235bd))
* **react:** remove typo around `"" 2` (#220) ([f73eb04](https://github.com/algolia/react-instantsearch/commit/f73eb04))
* **ScrollTo:** scroll to only if change triggered by the widget observed (#202) ([2d76022](https://github.com/algolia/react-instantsearch/commit/2d76022))
* **theme:** format the count of items appearing in a refinement (#217) ([2225c24](https://github.com/algolia/react-instantsearch/commit/2225c24))



<a name="4.1.0-beta.3"></a>
# [4.1.0-beta.3](https://github.com/algolia/react-instantsearch/compare/v4.1.0-beta.2...v4.1.0-beta.3) (2017-07-25)


### Bug Fixes

* **error:** reset error when receiving results of a query (not when sending it) (#179) ([bb12c29](https://github.com/algolia/react-instantsearch/commit/bb12c29))
* **highlight:** wrong parsing between client and server (#183) ([2daae70](https://github.com/algolia/react-instantsearch/commit/2daae70))
* **poweredBy:** SSR compatibility (#181) ([ec0fa8a](https://github.com/algolia/react-instantsearch/commit/ec0fa8a))


### BREAKING CHANGES

* **highlight:** We remove the timestamp present in our highlight preTag and postTag. If you were using regex to parse the
highlighting results then you'll need to adapt it as now it's only "ais-highlight".



<a name="4.1.0-beta.2"></a>
# [4.1.0-beta.2](https://github.com/algolia/react-instantsearch/compare/v4.1.0-beta.1...v4.1.0-beta.2) (2017-07-20)


### Bug Fixes

* **error:** reset error if next query is successful (#175) ([ff50a07](https://github.com/algolia/react-instantsearch/commit/ff50a07))



<a name="4.1.0-beta.1"></a>
# [4.1.0-beta.1](https://github.com/algolia/react-instantsearch/compare/v4.1.0-beta.0...v4.1.0-beta.1) (2017-07-12)



<a name="4.1.0-beta.0"></a>
# [4.1.0-beta.0](https://github.com/algolia/react-instantsearch/compare/v4.0.7...v4.1.0-beta.0) (2017-07-10)


### Bug Fixes

* **argos:** address flakyness (#152) ([84ef8f1](https://github.com/algolia/react-instantsearch/commit/84ef8f1))


### Features

* **server-side rendering:** Add API features for server-side rendering ([86b14d1](https://github.com/algolia/react-instantsearch/commit/86b14d1))



<a name="4.0.7"></a>
## [4.0.7](https://github.com/algolia/react-instantsearch/compare/v4.0.6...v4.0.7) (2017-07-06)


### Bug Fixes

* **results:** revert commit that ensure hits are returned only if right indices (#149) ([df9aa25](https://github.com/algolia/react-instantsearch/commit/df9aa25))



<a name="4.0.6"></a>
## [4.0.6](https://github.com/algolia/react-instantsearch/compare/v4.0.5...v4.0.6) (2017-06-29)


### Bug Fixes

* **store:** delay call to listener to prevent infinite loops (#143) ([0945958](https://github.com/algolia/react-instantsearch/commit/0945958))



<a name="4.0.5"></a>
## [4.0.5](https://github.com/algolia/react-instantsearch/compare/v4.0.4...v4.0.5) (2017-06-26)


### Bug Fixes

* **MultiIndex:** ensure getResults return only hits matching index in the context (#136) ([124ffe6](https://github.com/algolia/react-instantsearch/commit/124ffe6))
* **MultiIndex:** handle if namespace isn't in search state (#139) ([1aab324](https://github.com/algolia/react-instantsearch/commit/1aab324))
* **storybook:** process CSS through autoprefixer (#138) ([62cf512](https://github.com/algolia/react-instantsearch/commit/62cf512))



<a name="4.0.4"></a>
## [4.0.4](https://github.com/algolia/react-instantsearch/compare/v4.0.3...v4.0.4) (2017-06-19)


### Bug Fixes

* **MultiIndex:** handle switch between mono and multi index (#132) ([e161921](https://github.com/algolia/react-instantsearch/commit/e161921))



<a name="4.0.3"></a>
## [4.0.3](https://github.com/algolia/react-instantsearch/compare/v4.0.2...v4.0.3) (2017-06-14)


### Bug Fixes

* **SFFV:** search status we're not inside search state (#125) ([5f3e670](https://github.com/algolia/react-instantsearch/commit/5f3e670))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/algolia/react-instantsearch/compare/v4.0.1...v4.0.2) (2017-05-30)



<a name="4.0.1"></a>
## [4.0.1](https://github.com/algolia/react-instantsearch/compare/v4.0.0...v4.0.1) (2017-05-17)


### Bug Fixes

* **state:** nested attributes for faceting were not handled ([11bd122](https://github.com/algolia/react-instantsearch/commit/11bd122))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/algolia/react-instantsearch/compare/v4.0.0-beta.6...v4.0.0) (2017-05-15)

### Features and migration guide

You can find all the details of the release and the migration guide from v3 to v4 here: https://discourse.algolia.com/t/react-instantsearch-v4/1329.


<a name="4.0.0-beta.6"></a>
# [4.0.0-beta.6](https://github.com/algolia/react-instantsearch/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2017-05-04)



<a name="4.0.0-beta.5"></a>
# [4.0.0-beta.5](https://github.com/algolia/react-instantsearch/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2017-05-02)


### Bug Fixes

* **connectAutoComplete:** allow usage with hits from a single index (#75) ([8b3b358](https://github.com/algolia/react-instantsearch/commit/8b3b358)), closes [#74](https://github.com/algolia/react-instantsearch/issues/74)
* **InstantSearch:** update algoliaClient when it change (#70) ([9e97dbd](https://github.com/algolia/react-instantsearch/commit/9e97dbd))



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
