<p align="center">
  <a href="https://community.algolia.com/instantsearch.js">
    <img alt="InstantSearch.js" src="./docgen/assets/img/instantsearch-medal.svg" width="250">
  </a>

  <p align="center">
    InstantSearch.js is a JavaScript library for building performant and instant search experiences with <a href="https://www.algolia.com/?utm_source=instantsearch.js&utm_campaign=repository">Algolia</a>.
  </p>
</p>

---

[![Build Status][travis-svg]][travis-url] [![Version][version-svg]][package-url] [![License][license-image]][license-url]

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

// 2. Create an interactive search box
search.addWidget(
  instantsearch.widgets.searchBox({
    container: document.querySelector('#searchBox'),
    placeholder: 'Search for products',
  })
);

// 3. Plug the search results into the product container
search.addWidget(
  instantsearch.widgets.hits({
    container: document.querySelector('#products'),
    templates: {
      item: '{{{_highlightResult.name.value}}}',
    },
  })
);

// 4. Make the brands refinable
search.addWidget(
  instantsearch.widgets.refinementList({
    container: document.querySelector('#brand'),
    attribute: 'brand',
  })
);

// 5. Start the search!
search.start();
```

<p align="center">
  <a href="https://codesandbox.io/s/github/algolia/doc-code-samples/tree/master/InstantSearch.js/getting-started" title="Edit on CodeSandbox">
    <img alt="Preview" src="https://user-images.githubusercontent.com/6137112/41590781-27c9d4ba-73b8-11e8-823b-6ae3748db48a.png">
    <br>
    <img alt="Edit on CodeSandbox" src="https://codesandbox.io/static/img/play-codesandbox.svg">
  </a>
</p>

To learn more about the library, follow the [getting started](https://community.algolia.com/instantsearch.js/v2/getting-started.html) guide or check how to [add it to your own project](https://community.algolia.com/instantsearch.js/v2/guides/usage.html).

## Installation

```sh
npm install instantsearch.js algoliasearch
# or
yarn add instantsearch.js algoliasearch
```

## Documentation

The documentation is available at [community.algolia.com/instantsearch.js](https://community.algolia.com/instantsearch.js).

## Demos

| E-commerce                                                                                                                                                                                                                   | Media                                                                                                                                                                                                         | Travel                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="https://community.algolia.com/instantsearch.js/v2/examples/e-commerce/"><img src="https://community.algolia.com/instantsearch.js/v2/examples/e-commerce/capture.png" width="250" alt="E-commerce demo preview"></a> | <a href="https://community.algolia.com/instantsearch.js/v2/examples/media/"><img src="https://community.algolia.com/instantsearch.js/v2/examples/media/capture.png" width="250" alt="Media demo preview"></a> | <a href="https://community.algolia.com/instantsearch.js/v2/examples/tourism/"><img src="https://community.algolia.com/instantsearch.js/v2/examples/tourism/capture.png" width="250" alt="Tourism demo preview"></a> |

See more examples [on the website](https://community.algolia.com/instantsearch.js/v2/examples.html).

## Playground

You can get to know InstantSearch.js on [this playground](https://codesandbox.io/s/github/algolia/create-instantsearch-app/tree/templates/instantsearch.js).

Start by [adding widgets](https://community.algolia.com/instantsearch.js/v2/widgets.html) and tweaking the display. Once you feel familiar with the library, we recommend following the [getting started guide](https://community.algolia.com/instantsearch.js/v2/getting-started.html).

## Browser support

We support the **last two versions of major browsers** (Chrome, Edge, Firefox, Safari).

To support [IE11](https://en.wikipedia.org/wiki/Internet_Explorer_11), we recommend loading [polyfill.io](https://polyfill.io) with the following URL `https://cdn.polyfill.io/v2/polyfill.min.js?features=default,Array.prototype.includes`

## Contributing

We welcome all contributors, from casual to regular 💙

* **Bug report**. Is something not working as expected? [Send a bug report](https://github.com/algolia/instantsearch.js/issues/new?template=Bug_report.md).
* **Feature request**. Would you like to add something to the library? [Send a feature request](https://github.com/algolia/instantsearch.js/issues/new?template=Feature_request.md).
* **Documentation**. Did you find a typo in the doc? Click on the `edit this page` button.
* **Development**. If you don't know where to start, you can check the open issues that are [tagged easy](https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A++++++%E2%9D%84%EF%B8%8F+easy%22), the [bugs](https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9D%A4+Bug%22) or [chores](https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9C%A8+Chore%22).

To start contributing to code, you need to:

1.  [Fork the project](https://help.github.com/articles/fork-a-repo/)
1.  [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1.  Install the dependencies: `yarn`
1.  Run the development mode: `yarn run dev`
1.  [Open the stories](http://localhost:8080)

Please read [our contribution process](CONTRIBUTING.md) to learn more.

## License

InstantSearch.js is [MIT licensed][license-url].

<!-- Badges -->

[version-svg]: https://img.shields.io/npm/v/instantsearch.js.svg?style=flat-square
[package-url]: https://npmjs.org/package/instantsearch.js
[travis-svg]: https://img.shields.io/travis/algolia/instantsearch.js/develop.svg?style=flat-square
[travis-url]: https://travis-ci.org/algolia/instantsearch.js
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE

<!-- Links -->

[algolia-website]: https://www.algolia.com/?utm_source=instantsearch.js&utm_campaign=repository
[react-instantsearch-github]: https://github.com/algolia/react-instantsearch/
[vue-instantsearch-github]: https://github.com/algolia/vue-instantsearch
[instantsearch-android-github]: https://github.com/algolia/instantsearch-android
[instantsearch-ios-github]: https://github.com/algolia/instantsearch-ios
[instantsearch-angular-github]: https://github.com/algolia/angular-instantsearch
