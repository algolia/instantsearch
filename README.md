<p align="center">
  <a href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/">
    <img alt="InstantSearch.js" src=".github/banner.png">
  </a>

  <p align="center">
    InstantSearch.js is a JavaScript library for building performant and instant search experiences with <a href="https://www.algolia.com/?utm_source=instantsearch.js&utm_campaign=repository">Algolia</a>.
  </p>
</p>

---

[![Version][version-svg]][package-url]
[![License][license-image]][license-url]
[![Build Status][ci-svg]][ci-url]
[![Pull reminders][pull-reminders-svg]][pull-reminders-url]

InstantSearch.js is a vanilla JavaScript library that lets you create an instant-search result experience using [Algolia][algolia-website]’s search API. It is part of the InstantSearch family:

**InstantSearch.js** | [React InstantSearch][react-instantsearch-github] | [Vue InstantSearch][vue-instantsearch-github] | [Angular InstantSearch][instantsearch-angular-github] | [React InstantSearch Native][react-instantsearch-github] | [InstantSearch Android][instantsearch-android-github] | [InstantSearch iOS][instantsearch-ios-github]

<details>
  <summary><strong>Table of contents</strong></summary>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Why](#why)
- [Getting started](#getting-started)
- [Installation](#installation)
- [Documentation](#documentation)
- [Demos](#demos)
- [Playground](#playground)
- [Browser support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

</details>

## Why

You should be using InstantSearch if you want to:

- Design search experiences with best practices
- Customize your components at will
- Remain independent from external frameworks

## Getting started

Using InstantSearch.js is as simple as adding this JavaScript code to your page:

```javascript
// 1. Instantiate the search
const search = instantsearch({
  indexName: 'instant_search',
  searchClient: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
});

search.addWidgets([
  // 2. Create an interactive search box
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search for products',
  }),

  // 3. Plug the search results into the product container
  instantsearch.widgets.hits({
    container: '#products',
    templates: {
      item: '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
    },
  }),

  // 4. Make the brands refinable
  instantsearch.widgets.refinementList({
    container: '#brand',
    attribute: 'brand',
  }),
]);

// 5. Start the search!
search.start();
```

<p align="center">
  <a href="https://codesandbox.io/s/github/algolia/doc-code-samples/tree/master/InstantSearch.js/getting-started" title="Edit on CodeSandbox">
    <img alt="Edit on CodeSandbox" src="https://codesandbox.io/static/img/play-codesandbox.svg">
  </a>
</p>

To learn more about the library, follow the [getting started](https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/) guide or check how to [add it to your own project](https://www.algolia.com/doc/guides/building-search-ui/installation/js/).

## Installation

```sh
npm install instantsearch.js algoliasearch
# or
yarn add instantsearch.js algoliasearch
```

## Documentation

The documentation is available on the [Algolia website](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/).

## Demos

| E-commerce                                                                                                                                                                                                                   | Media                                                                                                                                                                                                         | Travel                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://instantsearchjs.netlify.com/examples/e-commerce/"><img src="https://www.algolia.com/doc/assets/images/build-search-ui/demos/e-commerce-2c7ed6b6.png" width="250" alt="E-commerce demo preview"></a> | <a href="https://instantsearchjs.netlify.com/examples/media/"><img src="https://instantsearchjs.netlify.com/examples/media/capture.png" width="250" alt="Media demo preview"></a> | <a href="https://instantsearchjs.netlify.com/examples/tourism/"><img src="https://instantsearchjs.netlify.com/examples/tourism/capture.png" width="250" alt="Tourism demo preview"></a> |

See more demos [on the website](https://www.algolia.com/doc/guides/building-search-ui/resources/demos/js/).

## Playground

You can get to know InstantSearch.js on [this playground](https://codesandbox.io/s/github/algolia/create-instantsearch-app/tree/templates/instantsearch.js).

Start by [adding widgets](https://www.algolia.com/doc/guides/building-search-ui/widgets/showcase/js/) and tweaking the display. Once you feel familiar with the library, we recommend following the [getting started guide](https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/).

## Browser support

We support the **last two versions of major browsers** (Chrome, Edge, Firefox, Safari).

Please refer to the [browser support](https://www.algolia.com/doc/guides/building-search-ui/installation/js/#browser-support) section in the documentation to use InstantSearch.js on other browsers.

## Troubleshooting

Encountering an issue? Before reaching out to support, we recommend heading to our [FAQ](https://www.algolia.com/doc/guides/building-search-ui/troubleshooting/faq/js/) where you will find answers for the most common issues and gotchas with the library.

## Contributing

We welcome all contributors, from casual to regular 💙

- **Bug report**. Is something not working as expected? [Send a bug report](https://github.com/algolia/instantsearch.js/issues/new?template=Bug_report.md).
- **Feature request**. Would you like to add something to the library? [Send a feature request](https://github.com/algolia/instantsearch.js/issues/new?template=Feature_request.md).
- **Documentation**. Did you find a typo in the doc? [Open an issue](https://github.com/algolia/instantsearch.js/issues/new) and we'll take care of it.
- **Development**. If you don't know where to start, you can check the open issues that are [tagged easy](https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A++++++%E2%9D%84%EF%B8%8F+easy%22), the [bugs](https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9D%A4+Bug%22) or [chores](https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9C%A8+Chore%22).

To start contributing to code, you need to:

1.  [Fork the project](https://help.github.com/articles/fork-a-repo/)
1.  [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1.  Install the dependencies: `yarn`
1.  Run the development mode: `yarn start`
1.  [Open the stories](http://localhost:6006)

Please read [our contribution process](CONTRIBUTING.md) to learn more.

## License

InstantSearch.js is [MIT licensed][license-url].

<!-- Badges -->

[version-svg]: https://img.shields.io/npm/v/instantsearch.js.svg?style=flat-square
[package-url]: https://npmjs.org/package/instantsearch.js
[ci-svg]: https://img.shields.io/circleci/project/github/algolia/instantsearch.js.svg?style=flat-square
[ci-url]: https://circleci.com/gh/algolia/instantsearch.js
[pull-reminders-svg]: https://img.shields.io/badge/pull%20reminders-✓-success.svg?style=flat-square
[pull-reminders-url]: https://pullreminders.com?ref=badge
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE

<!-- Links -->

[algolia-website]: https://www.algolia.com/?utm_source=instantsearch.js&utm_campaign=repository
[react-instantsearch-github]: https://github.com/algolia/react-instantsearch/
[vue-instantsearch-github]: https://github.com/algolia/vue-instantsearch
[instantsearch-android-github]: https://github.com/algolia/instantsearch-android
[instantsearch-ios-github]: https://github.com/algolia/instantsearch-ios
[instantsearch-angular-github]: https://github.com/algolia/angular-instantsearch
