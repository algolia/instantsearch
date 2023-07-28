<p align="center">
  <a href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/">
    <img alt="InstantSearch.js" src=".github/banner.png">
  </a>

  <p align="center">
    InstantSearch is a JavaScript library for building performant and instant search experiences in vanilla JS, React, Vue and Angular with <a href="https://www.algolia.com/?utm_source=instantsearch.js&utm_campaign=repository">Algolia</a>.
  </p>
</p>

---

[![License][license-image]][license-url]
[![Build Status][ci-svg]][ci-url]

[InstantSearch][instantsearch-docs] is a JavaScript library that lets you create an instant-search result experience using [Algolia][algolia-website]’s search API.

There are multiple wrappers for popular frameworks, such as [React InstantSearch][react-instantsearch-docs], [Vue InstantSearch][vue-instantsearch-docs], and [Angular InstantSearch][angular-instantsearch-docs].

It is part of the InstantSearch family which is designed for different platforms:

**InstantSearch** | [Angular InstantSearch][instantsearch-angular-github] | [InstantSearch Android][instantsearch-android-github] | [InstantSearch iOS][instantsearch-ios-github]

<details>
  <summary><strong>Table of contents</strong></summary>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Packages](#packages)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

</details>

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [`algoliasearch-helper`](packages/algoliasearch-helper) | [![algoliasearch-helper npm version](https://img.shields.io/npm/v/algoliasearch-helper.svg?style=flat-square)](https://npmjs.org/package/algoliasearch-helper) | Helper for implementing advanced search features with Algolia |
| [`create-instantsearch-app`](packages/create-instantsearch-app) | [![create-instantsearch-app npm version](https://img.shields.io/npm/v/create-instantsearch-app.svg?style=flat-square)](https://npmjs.org/package/create-instantsearch-app) | Command-line utility to quickly bootstrap a project with InstantSearch |
| [`instantsearch.css`](packages/instantsearch.css) | [![instantsearch.css npm version](https://img.shields.io/npm/v/instantsearch.css.svg?style=flat-square)](https://npmjs.org/package/instantsearch.css) | Default CSS themes for InstantSearch |
| [`instantsearch.js`](packages/instantsearch.js) | [![instantsearch.js npm version](https://img.shields.io/npm/v/instantsearch.js.svg?style=flat-square)](https://npmjs.org/package/instantsearch.js) | InstantSearch.js |
| [`react-instantsearch`](packages/react-instantsearch) | [![react-instantsearch npm version](https://img.shields.io/npm/v/react-instantsearch.svg?style=flat-square)](https://npmjs.org/package/react-instantsearch)| React InstantSearch bundled library |
| [`react-instantsearch-core`](packages/react-instantsearch-core) | [![react-instantsearch-core npm version](https://img.shields.io/npm/v/react-instantsearch-core.svg?style=flat-square)](https://npmjs.org/package/react-instantsearch-core) | Runtime-independent React InstantSearch version |
| [`vue-instantsearch`](packages/vue-instantsearch) | [![vue-instantsearch npm version](https://img.shields.io/npm/v/vue-instantsearch.svg?style=flat-square)](https://npmjs.org/package/vue-instantsearch) | Vue InstantSearch |

## Contributing

We welcome all contributors, from casual to regular 💙

- **Bug report**. Is something not working as expected? [Send a bug report][contributing-bugreport].
- **Feature request**. Would you like to add something to the library? [Send a feature request][contributing-featurerequest].
- **Documentation**. Did you find a typo in the doc? [Open an issue][contributing-newissue] and we'll take care of it.
- **Development**. If you don't know where to start, you can check the open issues that are [tagged easy][contributing-label-easy], the [bugs][contributing-label-bug] or [chores][contributing-label-chore].

To start contributing to code, you need to:

1.  [Fork the project](https://help.github.com/articles/fork-a-repo/)
1.  [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1.  Install the dependencies: `yarn`
1.  [Pick a package to work on](#packages) and cd into it (e.g. `cd packages/react-instantsearch-hooks`)

Please read [our contribution process](CONTRIBUTING.md) to learn more.

## License

InstantSearch is [MIT licensed][license-url].

<!-- Badges -->

[ci-svg]: https://img.shields.io/circleci/project/github/algolia/instantsearch.svg?style=flat-square
[ci-url]: https://circleci.com/gh/algolia/instantsearch
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE

<!-- Links -->

[algolia-website]: https://www.algolia.com/?utm_source=instantsearch.js&utm_campaign=repository "Algolia's website"
[instantsearch-docs]: https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/?utm_source=instantsearch.js&utm_campaign=repository "InstantSearch.js documentation"
[react-instantsearch-docs]: https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/?utm_source=instantsearch.js&utm_campaign=repository "React InstantSearch documentation"
[vue-instantsearch-docs]: https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/vue/?utm_source=instantsearch.js&utm_campaign=repository "Vue InstantSearch documentation"
[angular-instantsearch-docs]: https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/angular/?utm_source=instantsearch.js&utm_campaign=repository "Angular InstantSearch documentation"
[instantsearch-android-github]: https://github.com/algolia/instantsearch-android
[instantsearch-ios-github]: https://github.com/algolia/instantsearch-ios
[instantsearch-angular-github]: https://github.com/algolia/angular-instantsearch
[contributing-bugreport]: https://github.com/algolia/instantsearch.js/issues/new?template=BUG_REPORT.yml&labels=triage
[contributing-featurerequest]: https://github.com/algolia/instantsearch.js/discussions/new?category=ideas&labels=triage&title=Feature%20request%3A%20
[contributing-newissue]: https://github.com/algolia/instantsearch.js/issues/new?labels=triage
[contributing-label-easy]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A+Easy%22
[contributing-label-bug]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Bug%22
[contributing-label-chore]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Chore%22
