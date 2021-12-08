# [6.17.0](https://github.com/algolia/react-instantsearch/compare/v6.16.0...v6.17.0) (2021-12-08)


### Bug Fixes

* **hooks:** throw invariant violations in production ([#3217](https://github.com/algolia/react-instantsearch/issues/3217)) ([6d3f99c](https://github.com/algolia/react-instantsearch/commit/6d3f99ca91f470ee742ddc55e95f57b1f1801d7b))


### Features

* **hooks:** introduce `useMenu` ([#3197](https://github.com/algolia/react-instantsearch/issues/3197)) ([15d1cc9](https://github.com/algolia/react-instantsearch/commit/15d1cc993437b111cd5a32f43ee1d2065c639ed4))
* **hooks:** introduce `useRange` ([#3198](https://github.com/algolia/react-instantsearch/issues/3198)) ([df1f1c8](https://github.com/algolia/react-instantsearch/commit/df1f1c8109dc684e74d3aee1bf0359f2a0e1b9f4))
* **hooks:** introduce `<DynamicWidgets>` ([#3216](https://github.com/algolia/react-instantsearch/issues/3216)) ([d99aea6](https://github.com/algolia/react-instantsearch/commit/d99aea6cfe9dea86ae6b98ee3762373f4b3843f1))
* **hooks:** introduce `useDynamicWidgets` ([#3210](https://github.com/algolia/react-instantsearch/issues/3210)) ([29c2ea2](https://github.com/algolia/react-instantsearch/commit/29c2ea22b91a39d9eb40a044ae9aab85f2612db8))
* **hooks:** introduce `useQueryRules` ([#3212](https://github.com/algolia/react-instantsearch/issues/3212)) ([3ef1e1e](https://github.com/algolia/react-instantsearch/commit/3ef1e1e4116b3e58b2c2134d0c60fbb9f40c1501))
* **hooks:** introduce SSR support ([#3221](https://github.com/algolia/react-instantsearch/issues/3221)) ([0a6b3ec](https://github.com/algolia/react-instantsearch/commit/0a6b3ec61942ad3849c6f078e21b3328679bffff))
* **hooks:** introduce useCurrentRefinements ([#3222](https://github.com/algolia/react-instantsearch/issues/3222)) ([7ebd8c3](https://github.com/algolia/react-instantsearch/commit/7ebd8c3da8c17b0bd7e0f8deab633b98fa052e7f))



# [6.16.0](https://github.com/algolia/react-instantsearch/compare/v6.15.0...v6.16.0) (2021-11-22)


### Bug Fixes

* **PoweredBy:** support environments with `window` but no `location` ([#3186](https://github.com/algolia/react-instantsearch/issues/3186)) ([22ff23b](https://github.com/algolia/react-instantsearch/commit/22ff23b67554683567393114c2f53cacec44f4a6))


### Features

* **DynamicWidgets:** release as stable ([#3090](https://github.com/algolia/react-instantsearch/issues/3090)) ([a4a1d9e](https://github.com/algolia/react-instantsearch/commit/a4a1d9e032b31c611d5d73fdda3a03ad705f5c68))
* **hooks:** introduce `usePagination` ([#3182](https://github.com/algolia/react-instantsearch/issues/3182)) ([d8b1b86](https://github.com/algolia/react-instantsearch/commit/d8b1b867bb598e801f1350e81b4a4220a8e528d7))
* **hooks:** introduce `useSortBy` ([#3190](https://github.com/algolia/react-instantsearch/issues/3190)) ([5cce33b](https://github.com/algolia/react-instantsearch/commit/5cce33b48032548fed76b592ee0201e3c42fc3c4))
* **hooks:** introduce `useHierarchicalMenu` ([#3199](https://github.com/algolia/react-instantsearch/issues/3199)) ([b347061](https://github.com/algolia/react-instantsearch/commit/b3470611b962ef55c55576c65a6307abc54e5efd))



# [6.15.0](https://github.com/algolia/react-instantsearch/compare/v6.14.0...v6.15.0) (2021-10-27)


### Bug Fixes

* **metadata:** stricter detection of user agent ([#3184](https://github.com/algolia/react-instantsearch/issues/3184)) ([994c8ae](https://github.com/algolia/react-instantsearch/commit/994c8ae055fc23a1a067d111d2f4727b1c7bf8ca))


### Features

* **hooks:** introduce `useConfigure` ([#3181](https://github.com/algolia/react-instantsearch/issues/3181)) ([aa2eb9b](https://github.com/algolia/react-instantsearch/commit/aa2eb9baec6335f8a3523ee8b9b761a217cfc734))



# [6.14.0](https://github.com/algolia/react-instantsearch/compare/v6.13.0...v6.14.0) (2021-10-26)


### Features

* **dependencies:** update algoliasearch-helper ([#3176](https://github.com/algolia/react-instantsearch/issues/3176)) ([a8708a3](https://github.com/algolia/react-instantsearch/commit/a8708a33f31632000bc827b076539b1cca7adf6f))
* **metadata:** expose widget information ([#3145](https://github.com/algolia/react-instantsearch/issues/3145)) ([46cddf8](https://github.com/algolia/react-instantsearch/commit/46cddf8fcc0291beaa34b04da7aaaa7f2566e52e))



# [6.13.0](https://github.com/algolia/react-instantsearch/compare/v6.12.1...v6.13.0) (2021-10-19)

This is the initial release of the experimental **React InstantSearch Hooks** package. Check out the [**Getting Started**](https://github.com/algolia/react-instantsearch/blob/e8d72cb1c7c45300ef7c273f1f163beb6dc57622/packages/react-instantsearch-hooks/README.md#getting-started) guide.

### Bug Fixes

- **core:** accept objects for `hitComponent` ([#3087](https://github.com/algolia/react-instantsearch/issues/3087)) ([4ae23d4](https://github.com/algolia/react-instantsearch/commit/4ae23d432a01ccbefff1fcdc865120aeca4d3efc))

### Features

- **hooks:** add InstantSearch and Index components ([#3133](https://github.com/algolia/react-instantsearch/issues/3133)) ([8e3370d](https://github.com/algolia/react-instantsearch/commit/8e3370ddb7d5e42b8b9a5ff6a1e4255490de7dbe))
- **hooks:** bootstrap Core package ([#3132](https://github.com/algolia/react-instantsearch/issues/3132)) ([d459e62](https://github.com/algolia/react-instantsearch/commit/d459e62f5cae4c98427ab302531873f5ee23d149))
- **hooks:** display experimental warning ([#3149](https://github.com/algolia/react-instantsearch/issues/3149)) ([623577c](https://github.com/algolia/react-instantsearch/commit/623577c50cd0c04cd87f719edafdcfa04b5527b6))
- **hooks:** export types ([#3159](https://github.com/algolia/react-instantsearch/issues/3159)) ([182348b](https://github.com/algolia/react-instantsearch/commit/182348b4a901823a7a41aee5d2b3bdc025cce48f))
- **hooks:** expose `displayName` on Contexts ([#3168](https://github.com/algolia/react-instantsearch/issues/3168)) ([dafd3c6](https://github.com/algolia/react-instantsearch/commit/dafd3c66d05fbec09ebf907209ac25f55804e6f5))
- **hooks:** friendly error when using Hooks with Core ([#3150](https://github.com/algolia/react-instantsearch/issues/3150)) ([d547ccf](https://github.com/algolia/react-instantsearch/commit/d547ccf7951299e2f6b1771e02fce052696ff65a))
- **hooks:** introduce `useConnector` ([#3137](https://github.com/algolia/react-instantsearch/issues/3137)) ([53e8afd](https://github.com/algolia/react-instantsearch/commit/53e8afd093b9950351467a16b82d528207ac34d2))
- **hooks:** introduce `useHits` ([#3147](https://github.com/algolia/react-instantsearch/issues/3147)) ([cc25cff](https://github.com/algolia/react-instantsearch/commit/cc25cff06e5ec216cba40fb8261372bc327001b6))
- **hooks:** introduce `useRefinementList` ([#3152](https://github.com/algolia/react-instantsearch/issues/3152)) ([0385cd9](https://github.com/algolia/react-instantsearch/commit/0385cd971635a8423ad687fab451d0778358389e))
- **hooks:** introduce `useSearchBox` ([#3146](https://github.com/algolia/react-instantsearch/issues/3146)) ([0d2c7f9](https://github.com/algolia/react-instantsearch/commit/0d2c7f9bd25b88cf725a1babd3b228ac804644c7))
- **hooks:** trigger single network request on load ([#3167](https://github.com/algolia/react-instantsearch/issues/3167)) ([ff1ea49](https://github.com/algolia/react-instantsearch/commit/ff1ea49079a7800fd61ba99ceeb74b9f513eb99d))
- **hooks:** type `useConnector` return as render state ([#3169](https://github.com/algolia/react-instantsearch/issues/3169)) ([a801468](https://github.com/algolia/react-instantsearch/commit/a80146860164a092d2c90ee0aa4fcef88d5b675f))
- **hooks:** update GitHub bug reports link ([#3157](https://github.com/algolia/react-instantsearch/issues/3157)) ([568b5c8](https://github.com/algolia/react-instantsearch/commit/568b5c83849a3927417907706656c3835163f216))



## [6.12.1](https://github.com/algolia/react-instantsearch/compare/v6.12.0...v6.12.1) (2021-08-02)


### Bug Fixes

* **server side rendering:** return a value from mock currentRefinement/metadata ([#3078](https://github.com/algolia/react-instantsearch/issues/3078)) ([09f802b](https://github.com/algolia/react-instantsearch/commit/09f802b))



# [6.12.0](https://github.com/algolia/react-instantsearch/compare/v6.11.2...v6.12.0) (2021-07-06)


### Bug Fixes

* **HitsPerPage:** Adds id prop to HitsPerPage, Select components ([#3072](https://github.com/algolia/react-instantsearch/issues/3072)) ([bc75d75](https://github.com/algolia/react-instantsearch/commit/bc75d75))
* **MenuSelect:** Adds id prop to MenuSelect ([#3073](https://github.com/algolia/react-instantsearch/issues/3073)) ([fddaaef](https://github.com/algolia/react-instantsearch/commit/fddaaef))
* **SearchBox:** Adds inputId prop to SearchBox ([#3074](https://github.com/algolia/react-instantsearch/issues/3074)) ([a05f6a4](https://github.com/algolia/react-instantsearch/commit/a05f6a4))
* **SortBy:** Adds `id` prop to `SortBy`, `Select` components ([#3068](https://github.com/algolia/react-instantsearch/issues/3068)) ([1f2797f](https://github.com/algolia/react-instantsearch/commit/1f2797f))


### Features

* **DynamicWidgets:** add implementation ([#3056](https://github.com/algolia/react-instantsearch/issues/3056)) ([691ef87](https://github.com/algolia/react-instantsearch/commit/691ef87))
* **facets:** add a new option "facetOrdering" to Menu, RefinementList & HierarchicalMenu ([#3067](https://github.com/algolia/react-instantsearch/issues/3067)) ([731d9ba](https://github.com/algolia/react-instantsearch/commit/731d9ba))



## [6.11.2](https://github.com/algolia/react-instantsearch/compare/v6.11.1...v6.11.2) (2021-06-28)


### Bug Fixes

* **maps:** leave zoom in place if the bounds did not change ([#3050](https://github.com/algolia/react-instantsearch/issues/3050)) ([c430598](https://github.com/algolia/react-instantsearch/commit/c430598))



## [6.11.1](https://github.com/algolia/react-instantsearch/compare/v6.11.0...v6.11.1) (2021-06-09)


### Bug Fixes

* **RefinementList:** prevent searchable component to refine on empty list ([#3059](https://github.com/algolia/react-instantsearch/issues/3059)) ([04f3644](https://github.com/algolia/react-instantsearch/commit/04f3644))



# [6.11.0](https://github.com/algolia/react-instantsearch/compare/v6.10.3...v6.11.0) (2021-05-04)


### Features

* **connectNumericMenu:** add support for floating point values ([#3047](https://github.com/algolia/react-instantsearch/issues/3047)) ([091bf57](https://github.com/algolia/react-instantsearch/commit/091bf57))



## [6.10.3](https://github.com/algolia/react-instantsearch/compare/v6.10.2...v6.10.3) (2021-03-03)


### Bug Fixes

* **RelevantSort:** Rename `SmartSort` widget to `RelevantSort` ([#3026](https://github.com/algolia/react-instantsearch/issues/3026)) ([47d11bf](https://github.com/algolia/react-instantsearch/commit/47d11bf))



## [6.10.2](https://github.com/algolia/react-instantsearch/compare/v6.10.1...v6.10.2) (2021-03-03)


### Bug Fixes

* **infiniteHits:** fix stale hits issue ([#3021](https://github.com/algolia/react-instantsearch/issues/3021)) ([a9a29c7](https://github.com/algolia/react-instantsearch/commit/a9a29c7))



## [6.10.1](https://github.com/algolia/react-instantsearch/compare/v6.10.0...v6.10.1) (2021-03-02)


### Bug Fixes

* **SmartSort:** make `textComponent` and `buttonTextComponent` optional ([#3014](https://github.com/algolia/react-instantsearch/issues/3014)) ([682ee6d](https://github.com/algolia/react-instantsearch/commit/682ee6d))



# [6.10.0](https://github.com/algolia/react-instantsearch/compare/v6.9.0...v6.10.0) (2021-02-23)


### Bug Fixes

* **infiniteHits:** do not cache the cached hits ([#3011](https://github.com/algolia/react-instantsearch/issues/3011)) ([b56f5f7](https://github.com/algolia/react-instantsearch/commit/b56f5f7))


### Features

* **smartSort:** add widget ([#3009](https://github.com/algolia/react-instantsearch/issues/3009)) ([4cc8412](https://github.com/algolia/react-instantsearch/commit/4cc8412)), closes [#3010](https://github.com/algolia/react-instantsearch/issues/3010)



# [6.9.0](https://github.com/algolia/react-instantsearch/compare/v6.8.3...v6.9.0) (2021-02-03)


### Features

* **answers:** add `EXPERIMENTAL_Answers` widget ([#2996](https://github.com/algolia/react-instantsearch/issues/2996)) ([55e4191](https://github.com/algolia/react-instantsearch/commit/55e4191)), closes [#3005](https://github.com/algolia/react-instantsearch/issues/3005)



## [6.8.3](https://github.com/algolia/react-instantsearch/compare/v6.8.2...v6.8.3) (2021-01-22)


### Bug Fixes

* upgrade prop-types dependency to 15.6+ ([#3003](https://github.com/algolia/react-instantsearch/issues/3003)) ([fc03496](https://github.com/algolia/react-instantsearch/commit/fc03496))



## [6.8.2](https://github.com/algolia/react-instantsearch/compare/v6.8.1...v6.8.2) (2020-10-21)


### Bug Fixes

* **ssr:** provide metadata default value ([0a2f34c](https://github.com/algolia/react-instantsearch/commit/0a2f34c))



## [6.8.1](https://github.com/algolia/react-instantsearch/compare/v6.8.0...v6.8.1) (2020-10-14)


### Bug Fixes

* **ssr:** hydrate metadata with a value ([9249c19](https://github.com/algolia/react-instantsearch/commit/9249c19))



# [6.8.0](https://github.com/algolia/react-instantsearch/compare/v6.7.0...v6.8.0) (2020-10-14)


### Bug Fixes

* **ssr:** make sure metadata is available on initial render ([#2973](https://github.com/algolia/react-instantsearch/issues/2973)) ([be43b65](https://github.com/algolia/react-instantsearch/commit/be43b65)), closes [#2972](https://github.com/algolia/react-instantsearch/issues/2972)
* add missing dependencies ([#2975](https://github.com/algolia/react-instantsearch/issues/2975)) ([22ecb3c](https://github.com/algolia/react-instantsearch/commit/22ecb3c))
* **ConfigureRelatedItems:** support nested attributes ([#2967](https://github.com/algolia/react-instantsearch/issues/2967)) ([86dfe86](https://github.com/algolia/react-instantsearch/commit/86dfe86))
* **ssr:** allow "params" to be optional in custom clients ([#2961](https://github.com/algolia/react-instantsearch/issues/2961)) ([c3e3d2e](https://github.com/algolia/react-instantsearch/commit/c3e3d2e)), closes [#2958](https://github.com/algolia/react-instantsearch/issues/2958)



# [6.7.0](https://github.com/algolia/react-instantsearch/compare/v6.5.0...v6.7.0) (2020-07-20)


### Bug Fixes

* **core:** appending successful index search results by returning new object reference ([#2953](https://github.com/algolia/react-instantsearch/issues/2953)) ([0a711a7](https://github.com/algolia/react-instantsearch/commit/0a711a7))
* **ssr:** remove second instance of "query" in the response "params" for SSR ([#2945](https://github.com/algolia/react-instantsearch/issues/2945)) ([bf837c5](https://github.com/algolia/react-instantsearch/commit/bf837c5)), closes [#2941](https://github.com/algolia/react-instantsearch/issues/2941)


### Features

* **infinite-hits:** support cache ([#2921](https://github.com/algolia/react-instantsearch/issues/2921)) ([7b26adc](https://github.com/algolia/react-instantsearch/commit/7b26adc))



# [6.6.0](https://github.com/algolia/react-instantsearch/compare/v6.5.0...v6.6.0) (2020-06-15)


### Features

* **infiniteHits:** support cache ([#2921](https://github.com/algolia/react-instantsearch/issues/2921)) ([7b26adc](https://github.com/algolia/react-instantsearch/commit/7b26adc))



# [6.5.0](https://github.com/algolia/react-instantsearch/compare/v6.4.0...v6.5.0) (2020-05-18)


### Bug Fixes

* **connectQueryRules:** fix crash when using connectQueryRules with multiple indexes ([#2903](https://github.com/algolia/react-instantsearch/issues/2903)) ([c66d612](https://github.com/algolia/react-instantsearch/commit/c66d612))
* **core:** fix maximum call stack size exceeded ([#2926](https://github.com/algolia/react-instantsearch/issues/2926)) ([7e883df](https://github.com/algolia/react-instantsearch/commit/7e883df))


### Features

* **SearchBox:** provide input element ref ([#2913](https://github.com/algolia/react-instantsearch/issues/2913)) ([b41bff2](https://github.com/algolia/react-instantsearch/commit/b41bff2))



# [6.4.0](https://github.com/algolia/react-instantsearch/compare/v6.3.0...v6.4.0) (2020-03-18)


### Bug Fixes

* **deps:** fix "too much recursion" error with circular deps ([#2899](https://github.com/algolia/react-instantsearch/issues/2899)) ([c5f27a1](https://github.com/algolia/react-instantsearch/commit/c5f27a1))



# [6.3.0](https://github.com/algolia/react-instantsearch/compare/v6.2.0...v6.3.0) (2020-01-30)


### Features

* **algoliasearch:** add support for algoliasearch v4 ([#2890](https://github.com/algolia/react-instantsearch/issues/2890)) ([c6c7382](https://github.com/algolia/react-instantsearch/commit/c6c7382))



# [6.2.0](https://github.com/algolia/react-instantsearch/compare/v6.1.0...v6.2.0) (2020-01-20)


### Bug Fixes

* **deps:** update dependency algoliasearch to v3.35.1 ([#2802](https://github.com/algolia/react-instantsearch/issues/2802)) ([cfb91f0](https://github.com/algolia/react-instantsearch/commit/cfb91f0))
* **widgets:** rename `ExperimentalConfigureRelatedItems` compon… ([#2891](https://github.com/algolia/react-instantsearch/issues/2891)) ([b910df2](https://github.com/algolia/react-instantsearch/commit/b910df2))


### Features

* **insights:** add getInsightsAnonymousUserToken helper ([#2887](https://github.com/algolia/react-instantsearch/issues/2887)) ([b5fe4f7](https://github.com/algolia/react-instantsearch/commit/b5fe4f7))
* **widgets:** introduce `ConfigureRelatedItems` as experimental ([#2880](https://github.com/algolia/react-instantsearch/issues/2880)) ([923cd43](https://github.com/algolia/react-instantsearch/commit/923cd43))



# [6.1.0](https://github.com/algolia/react-instantsearch/compare/v6.0.0...v6.1.0) (2019-12-17)


### Bug Fixes

* **connectNumericMenu:** support numeric refinement 0 ([#2882](https://github.com/algolia/react-instantsearch/issues/2882)) ([30bd9fd](https://github.com/algolia/react-instantsearch/commit/30bd9fd))
* **deps:** update dependency next to v9.1.1 ([9d49d33](https://github.com/algolia/react-instantsearch/commit/9d49d33))
* **helper:** rely on stable version of algoliasearch-helper ([#2871](https://github.com/algolia/react-instantsearch/issues/2871)) ([e3531a1](https://github.com/algolia/react-instantsearch/commit/e3531a1))


### Features

* **insights:** show an error when 'clickAnalytics: true' is missing. ([#2877](https://github.com/algolia/react-instantsearch/issues/2877)) ([621656a](https://github.com/algolia/react-instantsearch/commit/621656a))
* **voice:** add additionalQueryParameters ([#2366](https://github.com/algolia/react-instantsearch/issues/2366)) ([3a45b2c](https://github.com/algolia/react-instantsearch/commit/3a45b2c))



# [6.0.0](https://github.com/algolia/react-instantsearch/compare/v6.0.0-beta.2...v6.0.0) (2019-10-28)



# [6.0.0-beta.2](https://github.com/algolia/react-instantsearch/compare/v6.0.0-beta.1...v6.0.0-beta.2) (2019-10-25)


### Bug Fixes

* serialize cache value on hydrate ([#2862](https://github.com/algolia/react-instantsearch/issues/2862)) ([3319665](https://github.com/algolia/react-instantsearch/commit/3319665)), closes [#2828](https://github.com/algolia/react-instantsearch/issues/2828)



# [6.0.0-beta.1](https://github.com/algolia/react-instantsearch/compare/v5.7.0...v6.0.0-beta.1) (2019-10-18)


### Bug Fixes

* **connectToggleRefinement:** cast currentRefinement to boolean ([#2701](https://github.com/algolia/react-instantsearch/issues/2701)) ([db934fd](https://github.com/algolia/react-instantsearch/commit/db934fd))
* **deps:** update dependency antd to v3.19.3 ([#2530](https://github.com/algolia/react-instantsearch/issues/2530)) ([73636c5](https://github.com/algolia/react-instantsearch/commit/73636c5))
* **deps:** update dependency antd to v3.19.4 ([#2559](https://github.com/algolia/react-instantsearch/issues/2559)) ([c3e8267](https://github.com/algolia/react-instantsearch/commit/c3e8267))
* **deps:** update dependency antd to v3.19.5 ([#2560](https://github.com/algolia/react-instantsearch/issues/2560)) ([72efd31](https://github.com/algolia/react-instantsearch/commit/72efd31))
* **deps:** update dependency antd to v3.19.6 ([#2564](https://github.com/algolia/react-instantsearch/issues/2564)) ([654f986](https://github.com/algolia/react-instantsearch/commit/654f986))
* **deps:** update dependency antd to v3.19.7 ([#2573](https://github.com/algolia/react-instantsearch/issues/2573)) ([7e963ad](https://github.com/algolia/react-instantsearch/commit/7e963ad))
* **deps:** update dependency antd to v3.19.8 ([#2584](https://github.com/algolia/react-instantsearch/issues/2584)) ([34dd9b2](https://github.com/algolia/react-instantsearch/commit/34dd9b2))
* **deps:** update dependency antd to v3.20.0 ([#2611](https://github.com/algolia/react-instantsearch/issues/2611)) ([b976c67](https://github.com/algolia/react-instantsearch/commit/b976c67))
* **deps:** update dependency antd to v3.20.1 ([#2635](https://github.com/algolia/react-instantsearch/issues/2635)) ([792ad9c](https://github.com/algolia/react-instantsearch/commit/792ad9c))
* **deps:** update dependency antd to v3.20.2 ([#2655](https://github.com/algolia/react-instantsearch/issues/2655)) ([301c2d8](https://github.com/algolia/react-instantsearch/commit/301c2d8))
* **deps:** update dependency antd to v3.20.3 ([#2658](https://github.com/algolia/react-instantsearch/issues/2658)) ([d078e70](https://github.com/algolia/react-instantsearch/commit/d078e70))
* **deps:** update dependency antd to v3.20.5 ([#2686](https://github.com/algolia/react-instantsearch/issues/2686)) ([42ef821](https://github.com/algolia/react-instantsearch/commit/42ef821))
* **deps:** update dependency antd to v3.20.6 ([#2711](https://github.com/algolia/react-instantsearch/issues/2711)) ([927fbfe](https://github.com/algolia/react-instantsearch/commit/927fbfe))
* **deps:** update dependency antd to v3.20.7 ([#2712](https://github.com/algolia/react-instantsearch/issues/2712)) ([1830952](https://github.com/algolia/react-instantsearch/commit/1830952))
* **deps:** update dependency antd to v3.21.1 ([#2736](https://github.com/algolia/react-instantsearch/issues/2736)) ([39a51a6](https://github.com/algolia/react-instantsearch/commit/39a51a6))
* **deps:** update dependency antd to v3.21.2 ([#2738](https://github.com/algolia/react-instantsearch/issues/2738)) ([a7a998a](https://github.com/algolia/react-instantsearch/commit/a7a998a))
* **deps:** update dependency antd to v3.21.4 ([#2747](https://github.com/algolia/react-instantsearch/issues/2747)) ([60012be](https://github.com/algolia/react-instantsearch/commit/60012be))
* **deps:** update dependency antd to v3.22.0 ([#2758](https://github.com/algolia/react-instantsearch/issues/2758)) ([9cda468](https://github.com/algolia/react-instantsearch/commit/9cda468))
* **deps:** update dependency antd to v3.22.2 ([#2791](https://github.com/algolia/react-instantsearch/issues/2791)) ([ff1f5d9](https://github.com/algolia/react-instantsearch/commit/ff1f5d9))
* **deps:** update dependency antd to v3.23.2 ([#2814](https://github.com/algolia/react-instantsearch/issues/2814)) ([a190410](https://github.com/algolia/react-instantsearch/commit/a190410))
* **deps:** update dependency lodash to v4.17.13 ([c4974cf](https://github.com/algolia/react-instantsearch/commit/c4974cf))
* **deps:** update dependency lodash to v4.17.14 ([#2647](https://github.com/algolia/react-instantsearch/issues/2647)) ([a2d2dd5](https://github.com/algolia/react-instantsearch/commit/a2d2dd5))
* **deps:** update dependency lodash to v4.17.15 ([#2684](https://github.com/algolia/react-instantsearch/issues/2684)) ([354143f](https://github.com/algolia/react-instantsearch/commit/354143f))
* **deps:** update dependency next to v9 ([#2638](https://github.com/algolia/react-instantsearch/issues/2638)) ([d22f61d](https://github.com/algolia/react-instantsearch/commit/d22f61d))
* **deps:** update dependency next to v9.0.1 ([#2652](https://github.com/algolia/react-instantsearch/issues/2652)) ([2c2dab9](https://github.com/algolia/react-instantsearch/commit/2c2dab9))
* **deps:** update dependency next to v9.0.2 ([#2662](https://github.com/algolia/react-instantsearch/issues/2662)) ([6fa4c5e](https://github.com/algolia/react-instantsearch/commit/6fa4c5e))
* **deps:** update dependency next to v9.0.3 ([#2724](https://github.com/algolia/react-instantsearch/issues/2724)) ([f51b04b](https://github.com/algolia/react-instantsearch/commit/f51b04b))
* **deps:** update dependency next to v9.0.4 ([#2767](https://github.com/algolia/react-instantsearch/issues/2767)) ([9af9180](https://github.com/algolia/react-instantsearch/commit/9af9180))
* **deps:** update dependency next to v9.0.5 ([#2789](https://github.com/algolia/react-instantsearch/issues/2789)) ([0a75f41](https://github.com/algolia/react-instantsearch/commit/0a75f41))
* **deps:** update dependency qs to v6.8.0 ([#2757](https://github.com/algolia/react-instantsearch/issues/2757)) ([8bffb87](https://github.com/algolia/react-instantsearch/commit/8bffb87))
* **deps:** update dependency react-compound-slider to v2.1.0 ([#2610](https://github.com/algolia/react-instantsearch/issues/2610)) ([3389ee5](https://github.com/algolia/react-instantsearch/commit/3389ee5))
* **deps:** update dependency react-compound-slider to v2.2.0 ([#2649](https://github.com/algolia/react-instantsearch/issues/2649)) ([7b81af1](https://github.com/algolia/react-instantsearch/commit/7b81af1))
* **deps:** update dependency react-native-vector-icons to v6.5.0 ([#2520](https://github.com/algolia/react-instantsearch/issues/2520)) ([5f7f5b6](https://github.com/algolia/react-instantsearch/commit/5f7f5b6))
* **deps:** update dependency react-native-vector-icons to v6.6.0 ([#2599](https://github.com/algolia/react-instantsearch/issues/2599)) ([b6bb199](https://github.com/algolia/react-instantsearch/commit/b6bb199))
* **deps:** update dependency react-router-dom to v5.0.1 ([#2506](https://github.com/algolia/react-instantsearch/issues/2506)) ([d762230](https://github.com/algolia/react-instantsearch/commit/d762230))
* **highlight:** switch to index as key ([#2691](https://github.com/algolia/react-instantsearch/issues/2691)) ([17e75d1](https://github.com/algolia/react-instantsearch/commit/17e75d1)), closes [#2688](https://github.com/algolia/react-instantsearch/issues/2688)
* **voiceSearch:** fix incorrect status on stop ([#2535](https://github.com/algolia/react-instantsearch/issues/2535)) ([824dc22](https://github.com/algolia/react-instantsearch/commit/824dc22))


### chore

* **release:** 6.0.0-beta.1 ([#2861](https://github.com/algolia/react-instantsearch/issues/2861)) ([cb56ca0](https://github.com/algolia/react-instantsearch/commit/cb56ca0)), closes [#2023](https://github.com/algolia/react-instantsearch/issues/2023) [#2178](https://github.com/algolia/react-instantsearch/issues/2178) [#2178](https://github.com/algolia/react-instantsearch/issues/2178) [#2179](https://github.com/algolia/react-instantsearch/issues/2179) [#2180](https://github.com/algolia/react-instantsearch/issues/2180) [#2181](https://github.com/algolia/react-instantsearch/issues/2181) [#2185](https://github.com/algolia/react-instantsearch/issues/2185) [#2192](https://github.com/algolia/react-instantsearch/issues/2192) [#2189](https://github.com/algolia/react-instantsearch/issues/2189) [#2190](https://github.com/algolia/react-instantsearch/issues/2190) [#2179](https://github.com/algolia/react-instantsearch/issues/2179) [#2178](https://github.com/algolia/react-instantsearch/issues/2178) [#2180](https://github.com/algolia/react-instantsearch/issues/2180) [#2181](https://github.com/algolia/react-instantsearch/issues/2181) [#2185](https://github.com/algolia/react-instantsearch/issues/2185) [#2192](https://github.com/algolia/react-instantsearch/issues/2192) [#2190](https://github.com/algolia/react-instantsearch/issues/2190) [#2203](https://github.com/algolia/react-instantsearch/issues/2203) [#2432](https://github.com/algolia/react-instantsearch/issues/2432) [#2444](https://github.com/algolia/react-instantsearch/issues/2444) [#2357](https://github.com/algolia/react-instantsearch/issues/2357) [#2454](https://github.com/algolia/react-instantsearch/issues/2454) [#2455](https://github.com/algolia/react-instantsearch/issues/2455) [#2459](https://github.com/algolia/react-instantsearch/issues/2459) [#2458](https://github.com/algolia/react-instantsearch/issues/2458) [#2460](https://github.com/algolia/react-instantsearch/issues/2460) [#2442](https://github.com/algolia/react-instantsearch/issues/2442) [#2446](https://github.com/algolia/react-instantsearch/issues/2446) [#2434](https://github.com/algolia/react-instantsearch/issues/2434) [#2467](https://github.com/algolia/react-instantsearch/issues/2467) [#2466](https://github.com/algolia/react-instantsearch/issues/2466) [#2288](https://github.com/algolia/react-instantsearch/issues/2288) [#2290](https://github.com/algolia/react-instantsearch/issues/2290) [#2289](https://github.com/algolia/react-instantsearch/issues/2289) [#2305](https://github.com/algolia/react-instantsearch/issues/2305) [#2338](https://github.com/algolia/react-instantsearch/issues/2338) [#2461](https://github.com/algolia/react-instantsearch/issues/2461) [#2442](https://github.com/algolia/react-instantsearch/issues/2442) [#2307](https://github.com/algolia/react-instantsearch/issues/2307) [#2314](https://github.com/algolia/react-instantsearch/issues/2314) [#2304](https://github.com/algolia/react-instantsearch/issues/2304) [#2379](https://github.com/algolia/react-instantsearch/issues/2379) [#2552](https://github.com/algolia/react-instantsearch/issues/2552) [#2555](https://github.com/algolia/react-instantsearch/issues/2555) [#2536](https://github.com/algolia/react-instantsearch/issues/2536) [#2537](https://github.com/algolia/react-instantsearch/issues/2537) [#2339](https://github.com/algolia/react-instantsearch/issues/2339) [#2349](https://github.com/algolia/react-instantsearch/issues/2349) [#2570](https://github.com/algolia/react-instantsearch/issues/2570) [#2462](https://github.com/algolia/react-instantsearch/issues/2462) [#2600](https://github.com/algolia/react-instantsearch/issues/2600) [#2468](https://github.com/algolia/react-instantsearch/issues/2468) [#2626](https://github.com/algolia/react-instantsearch/issues/2626) [#2621](https://github.com/algolia/react-instantsearch/issues/2621) [#2627](https://github.com/algolia/react-instantsearch/issues/2627) [#2644](https://github.com/algolia/react-instantsearch/issues/2644) [#2626](https://github.com/algolia/react-instantsearch/issues/2626) [#2645](https://github.com/algolia/react-instantsearch/issues/2645) [#2339](https://github.com/algolia/react-instantsearch/issues/2339) [#2643](https://github.com/algolia/react-instantsearch/issues/2643) [#2467](https://github.com/algolia/react-instantsearch/issues/2467) [#2690](https://github.com/algolia/react-instantsearch/issues/2690) [#2687](https://github.com/algolia/react-instantsearch/issues/2687) [#2722](https://github.com/algolia/react-instantsearch/issues/2722) [#2568](https://github.com/algolia/react-instantsearch/issues/2568) [#2726](https://github.com/algolia/react-instantsearch/issues/2726) [#2379](https://github.com/algolia/react-instantsearch/issues/2379) [#2289](https://github.com/algolia/react-instantsearch/issues/2289) [#2290](https://github.com/algolia/react-instantsearch/issues/2290) [#2304](https://github.com/algolia/react-instantsearch/issues/2304) [#2307](https://github.com/algolia/react-instantsearch/issues/2307) [#2314](https://github.com/algolia/react-instantsearch/issues/2314) [#2288](https://github.com/algolia/react-instantsearch/issues/2288) [#2305](https://github.com/algolia/react-instantsearch/issues/2305) [#2701](https://github.com/algolia/react-instantsearch/issues/2701) [#2568](https://github.com/algolia/react-instantsearch/issues/2568) [#2357](https://github.com/algolia/react-instantsearch/issues/2357) [#2552](https://github.com/algolia/react-instantsearch/issues/2552) [#2530](https://github.com/algolia/react-instantsearch/issues/2530) [#2559](https://github.com/algolia/react-instantsearch/issues/2559) [#2560](https://github.com/algolia/react-instantsearch/issues/2560) [#2564](https://github.com/algolia/react-instantsearch/issues/2564) [#2573](https://github.com/algolia/react-instantsearch/issues/2573) [#2584](https://github.com/algolia/react-instantsearch/issues/2584) [#2611](https://github.com/algolia/react-instantsearch/issues/2611) [#2635](https://github.com/algolia/react-instantsearch/issues/2635) [#2655](https://github.com/algolia/react-instantsearch/issues/2655) [#2658](https://github.com/algolia/react-instantsearch/issues/2658) [#2686](https://github.com/algolia/react-instantsearch/issues/2686) [#2711](https://github.com/algolia/react-instantsearch/issues/2711) [#2712](https://github.com/algolia/react-instantsearch/issues/2712) [#2736](https://github.com/algolia/react-instantsearch/issues/2736) [#2738](https://github.com/algolia/react-instantsearch/issues/2738) [#2747](https://github.com/algolia/react-instantsearch/issues/2747) [#2758](https://github.com/algolia/react-instantsearch/issues/2758) [#2647](https://github.com/algolia/react-instantsearch/issues/2647) [#2684](https://github.com/algolia/react-instantsearch/issues/2684) [#2638](https://github.com/algolia/react-instantsearch/issues/2638) [#2652](https://github.com/algolia/react-instantsearch/issues/2652) [#2662](https://github.com/algolia/react-instantsearch/issues/2662) [#2724](https://github.com/algolia/react-instantsearch/issues/2724) [#2767](https://github.com/algolia/react-instantsearch/issues/2767) [#2757](https://github.com/algolia/react-instantsearch/issues/2757) [#2610](https://github.com/algolia/react-instantsearch/issues/2610) [#2649](https://github.com/algolia/react-instantsearch/issues/2649) [#2520](https://github.com/algolia/react-instantsearch/issues/2520) [#2599](https://github.com/algolia/react-instantsearch/issues/2599) [#2506](https://github.com/algolia/react-instantsearch/issues/2506) [#2467](https://github.com/algolia/react-instantsearch/issues/2467) [#2626](https://github.com/algolia/react-instantsearch/issues/2626) [#2690](https://github.com/algolia/react-instantsearch/issues/2690) [#2688](https://github.com/algolia/react-instantsearch/issues/2688) [#2626](https://github.com/algolia/react-instantsearch/issues/2626) [#2726](https://github.com/algolia/react-instantsearch/issues/2726) [#2535](https://github.com/algolia/react-instantsearch/issues/2535) [#2461](https://github.com/algolia/react-instantsearch/issues/2461) [#2434](https://github.com/algolia/react-instantsearch/issues/2434) [#2687](https://github.com/algolia/react-instantsearch/issues/2687) [#2338](https://github.com/algolia/react-instantsearch/issues/2338) [#2179](https://github.com/algolia/react-instantsearch/issues/2179) [#2180](https://github.com/algolia/react-instantsearch/issues/2180) [#2181](https://github.com/algolia/react-instantsearch/issues/2181) [#2185](https://github.com/algolia/react-instantsearch/issues/2185) [#2192](https://github.com/algolia/react-instantsearch/issues/2192) [#2189](https://github.com/algolia/react-instantsearch/issues/2189) [#2190](https://github.com/algolia/react-instantsearch/issues/2190) [#2179](https://github.com/algolia/react-instantsearch/issues/2179) [#2180](https://github.com/algolia/react-instantsearch/issues/2180) [#2181](https://github.com/algolia/react-instantsearch/issues/2181) [#2185](https://github.com/algolia/react-instantsearch/issues/2185) [#2192](https://github.com/algolia/react-instantsearch/issues/2192) [#2190](https://github.com/algolia/react-instantsearch/issues/2190) [#2536](https://github.com/algolia/react-instantsearch/issues/2536) [#2537](https://github.com/algolia/react-instantsearch/issues/2537) [#2834](https://github.com/algolia/react-instantsearch/issues/2834) [#2845](https://github.com/algolia/react-instantsearch/issues/2845) [#2842](https://github.com/algolia/react-instantsearch/issues/2842) [#2852](https://github.com/algolia/react-instantsearch/issues/2852) [#2853](https://github.com/algolia/react-instantsearch/issues/2853)


### BREAKING CHANGES

* **release:** translation will render default value if passed undefined as value

* chore(lodash): remove imports

* fix(translation): allow undefined value to be passed on purpose
* **release:** no longer do we allow paths like `attribute[5].something`, or other indexed forms, only `.` is allowed as special key.

All existing tests still pass, and we never documented you could use `lodash.get` patterns other than `.`.

* feat(get): accept array & bracked-separated string

moved to utils at the same time

* fix typo

* feedback: test for undefined behaviour

* chore(size): update expectation

this will go down afterwards, but for now there's some more duplication



# [6.0.0-beta.0](https://github.com/algolia/react-instantsearch/compare/v5.7.0...v6.0.0-beta.0) (2019-08-21)

[Migration guide](MIGRATION.md)

### Bug Fixes

* **react 17 compat:** upgrade RangeInput lifecycle ([#2289](https://github.com/algolia/react-instantsearch/issues/2289)) ([110b1af](https://github.com/algolia/react-instantsearch/commit/110b1af))
* **react 17 compat:** upgrade RangeSlider lifecycle ([#2290](https://github.com/algolia/react-instantsearch/issues/2290)) ([69a7f53](https://github.com/algolia/react-instantsearch/commit/69a7f53))
* **connectToggleRefinement:** cast currentRefinement to boolean ([#2701](https://github.com/algolia/react-instantsearch/issues/2701)) ([db934fd](https://github.com/algolia/react-instantsearch/commit/db934fd))
* **core:** searchState can be non-Object object ([#2722](https://github.com/algolia/react-instantsearch/issues/2722)) ([dea493c](https://github.com/algolia/react-instantsearch/commit/dea493c)), closes [#2568](https://github.com/algolia/react-instantsearch/issues/2568)
* **createConnector:** new React life cycles ([#2357](https://github.com/algolia/react-instantsearch/issues/2357)) ([fc10640](https://github.com/algolia/react-instantsearch/commit/fc10640))
* **createInstantSearchManager:** do not trigger search on index update ([#2552](https://github.com/algolia/react-instantsearch/issues/2552)) ([e209362](https://github.com/algolia/react-instantsearch/commit/e209362))
* **geo:** check for undefined in isEqual ([#2643](https://github.com/algolia/react-instantsearch/issues/2643)) ([a544231](https://github.com/algolia/react-instantsearch/commit/a544231)), closes [#2467](https://github.com/algolia/react-instantsearch/issues/2467)
* **geo:** remove lifecycle compat ([#2644](https://github.com/algolia/react-instantsearch/issues/2644)) ([2b2b898](https://github.com/algolia/react-instantsearch/commit/2b2b898)), closes [#2626](https://github.com/algolia/react-instantsearch/issues/2626)
* **highlight:** switch to index as key ([#2690](https://github.com/algolia/react-instantsearch/issues/2690)) ([51de682](https://github.com/algolia/react-instantsearch/commit/51de682)), closes [#2688](https://github.com/algolia/react-instantsearch/issues/2688)
* **peerDependencies:** update React ([#2626](https://github.com/algolia/react-instantsearch/issues/2626)) ([6ccad49](https://github.com/algolia/react-instantsearch/commit/6ccad49))
* **ssr:** avoid duplicate serializing ([#2726](https://github.com/algolia/react-instantsearch/issues/2726)) ([c768b1a](https://github.com/algolia/react-instantsearch/commit/c768b1a))
* **voiceSearch:** fix incorrect status on stop ([#2535](https://github.com/algolia/react-instantsearch/issues/2535)) ([824dc22](https://github.com/algolia/react-instantsearch/commit/824dc22))


### Code Refactoring

* **lodash:** get ([#2461](https://github.com/algolia/react-instantsearch/issues/2461)) ([527b879](https://github.com/algolia/react-instantsearch/commit/527b879))
* **lodash:** has ([#2434](https://github.com/algolia/react-instantsearch/issues/2434)) ([75a4a15](https://github.com/algolia/react-instantsearch/commit/75a4a15))
* **lodash:** has been fully removed

### Features

* **autocomplete:** add queryID & position to provided hits ([#2687](https://github.com/algolia/react-instantsearch/issues/2687)) ([e453dab](https://github.com/algolia/react-instantsearch/commit/e453dab))
* **client:** remove algoliaClient, appId & apiKey ([#2338](https://github.com/algolia/react-instantsearch/issues/2338)) ([b84a0b5](https://github.com/algolia/react-instantsearch/commit/b84a0b5)) (use searchClient exclusively now)
* **context:** migrate to new React context ([#2178](https://github.com/algolia/react-instantsearch/issues/2178)) ([0a1abea](https://github.com/algolia/react-instantsearch/commit/0a1abea)), closes [#2179](https://github.com/algolia/react-instantsearch/issues/2179) [#2180](https://github.com/algolia/react-instantsearch/issues/2180) [#2181](https://github.com/algolia/react-instantsearch/issues/2181) [#2185](https://github.com/algolia/react-instantsearch/issues/2185) [#2192](https://github.com/algolia/react-instantsearch/issues/2192) [#2189](https://github.com/algolia/react-instantsearch/issues/2189) [#2190](https://github.com/algolia/react-instantsearch/issues/2190) [#2179](https://github.com/algolia/react-instantsearch/issues/2179) [#2180](https://github.com/algolia/react-instantsearch/issues/2180) [#2181](https://github.com/algolia/react-instantsearch/issues/2181) [#2185](https://github.com/algolia/react-instantsearch/issues/2185) [#2192](https://github.com/algolia/react-instantsearch/issues/2192) [#2190](https://github.com/algolia/react-instantsearch/issues/2190)
* **ssr:** update the SSR API ([#2555](https://github.com/algolia/react-instantsearch/issues/2555)) ([925bdb8](https://github.com/algolia/react-instantsearch/commit/925bdb8)), closes [#2536](https://github.com/algolia/react-instantsearch/issues/2536) [#2537](https://github.com/algolia/react-instantsearch/issues/2537)


### BREAKING CHANGES

* **searchClient:** argument is the only option now.

Previously there were three options to pass a search client: searchClient, appId & apiKey, algoliaClient. The latter two have been removed, and now only `searchClient` is accepted. This searchClient is an instance of the `algoliasearch` module:

```js
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'myAppId',
  'myApiKey',
  { _useRequestCache: true }
);

// ...
<InstantSearch searchClient={searchClient} />
```

If you were relying on duplicate requests not being fired when using appId & apiKey before, you need to enable the `_useRequestCache` option now.

* **SSR:** imports have changed

In the server, you now directly import `findResultsState`, which now requires a `searchClient` in the second argument.

In the App, you now use a regular `InstantSearch` component.

* **Index & InstantSearch:** Remove `root` DOM element

These elements now are pure containers for their children, and don't add a `div` to the DOM anymore. If you were relying on those for styling, wrap the `InstantSearch` and `Index` element with a `div` with an appropriate class.

* **Index & InstantSearch:** Remove support for `root` prop

Since these two arguments now no longer wrap their children in an element, they no longer accept a `root` prop.

* **Highlight:** some paths will no longer be accepted

We only accept paths separated with a dot or bracket now, like before. It's possible that a different type of path worked undocumented, but no longer does.

* **algoliasearch-helper:** updating to the next major version

This library is mostly internal, but it has had a major refactor (including removing lodash). This has no impact, unless you are dealing with it using `createConnector`. See the [migration guide](https://github.com/algolia/algoliasearch-helper-js/blob/next/documentation-src/metalsmith/content/upgrade.md) for the v3 of algoliasearch-helper for more information.

# [5.7.0](https://github.com/algolia/react-instantsearch/compare/v5.6.0...v5.7.0) (2019-06-04)


### Bug Fixes

* **highlight:** allow array as "attribute" ([#2474](https://github.com/algolia/react-instantsearch/issues/2474)) ([9dc829a](https://github.com/algolia/react-instantsearch/commit/9dc829a)), closes [#2461](https://github.com/algolia/react-instantsearch/issues/2461)
* **indexUtils:** allow index with dots in it ([#2350](https://github.com/algolia/react-instantsearch/issues/2350)) ([f91906f](https://github.com/algolia/react-instantsearch/commit/f91906f))


### Features

* **voiceSearch:** add voice search widget ([#2316](https://github.com/algolia/react-instantsearch/issues/2316)) ([0e3b124](https://github.com/algolia/react-instantsearch/commit/0e3b124))



# [5.6.0](https://github.com/algolia/react-instantsearch/compare/v5.5.0...v5.6.0) (2019-05-15)


### Bug Fixes

* **connectQueryRules:** avoid to throw an error with undefined values ([#2436](https://github.com/algolia/react-instantsearch/issues/2436)) ([1e18287](https://github.com/algolia/react-instantsearch/commit/1e18287))


### Features

* **infiniteHits:** add previous button ([#2296](https://github.com/algolia/react-instantsearch/issues/2296)) ([010a69a](https://github.com/algolia/react-instantsearch/commit/010a69a))



# [5.5.0](https://github.com/algolia/react-instantsearch/compare/v5.4.0...v5.5.0) (2019-04-23)


### Bug Fixes

* **createInstantSearch:** change the User-Agent to use the new specs ([#2209](https://github.com/algolia/react-instantsearch/issues/2209)) ([642ba0b](https://github.com/algolia/react-instantsearch/commit/642ba0b))


### Features

* **DOMMaps:** expose withGoogleMaps HOC [PART-1] ([#2000](https://github.com/algolia/react-instantsearch/issues/2000)) ([2ae1dea](https://github.com/algolia/react-instantsearch/commit/2ae1dea))
* **queryRules:** add Query Rules features ([#2286](https://github.com/algolia/react-instantsearch/issues/2286)) ([3ae9c01](https://github.com/algolia/react-instantsearch/commit/3ae9c01))
* **insights:** add insights features ([#2215](https://github.com/algolia/react-instantsearch/pull/2215)) ([961e7a7](https://github.com/algolia/react-instantsearch/commit/961e7a7))



# [5.4.0](https://github.com/algolia/react-instantsearch/compare/v5.4.0-beta.1...v5.4.0) (2019-02-05)


### Bug Fixes

* **DOMMaps:** set React & React DOM as peer deps ([#1922](https://github.com/algolia/react-instantsearch/issues/1922)) ([2f2cefd](https://github.com/algolia/react-instantsearch/commit/2f2cefd))



# [5.4.0-beta.1](https://github.com/algolia/react-instantsearch/compare/v5.4.0-beta.0...v5.4.0-beta.1) (2019-01-10)


### Bug Fixes

* **deps:** sync algoliasearch version ([#1879](https://github.com/algolia/react-instantsearch/issues/1879)) ([40f9c26](https://github.com/algolia/react-instantsearch/commit/40f9c26))
* **maps:** use stable version for peer deps ([#1887](https://github.com/algolia/react-instantsearch/issues/1887)) ([9055167](https://github.com/algolia/react-instantsearch/commit/9055167))



# [5.4.0-beta.0](https://github.com/algolia/react-instantsearch/compare/v5.3.2...v5.4.0-beta.0) (2019-01-08)


### Features

* **Index:** introduce `indexId` prop ([#1833](https://github.com/algolia/react-instantsearch/issues/1833)) ([ec9e0fb](https://github.com/algolia/react-instantsearch/commit/ec9e0fb))



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

You can find all the informations for the migration [in our documentation](https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#upgrade-from-v4-to-v5).



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

You can find all the informations for the migration [in our documentation](https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#upgrade-from-v4-to-v5).



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
