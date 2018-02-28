[![InstantSearch.js logo][logo]][website]

InstantSearch.js is a library for building blazing fast search-as-you-type search UIs with [Algolia][algolia-website].

InstantSearch.js is part of the InstantSearch family:
**InstantSearch.js**
| [React InstantSearch (web)][react-instantsearch-github]
| [Vue InstantSearch (web)][vue-instantsearch-github]
| [Angular InstantSearch (web)][instantsearch-angular-github]
| [React-native InstantSearch (native)][react-instantsearch-github]
| [InstantSearch Android (native)][instantsearch-android-github]
| [InstantSearch iOS (native)][instantsearch-ios-github].

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [About InstantSearch.js ⚡️](#about-instantsearchjs-%EF%B8%8F)
- [Getting started ⌨️](#getting-started-)
- [Browser support 🌍](#browser-support-)
- [Contributing, dev, release 🚀](#contributing-dev-release-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## About InstantSearch.js ⚡️

> ⚡ Lightning-fast search for your apps

This library is built and maintained by the contributors and the peeps at [Algolia][algolia-website].

The documentation available at <https://community.algolia.com/instantsearch.js/>.

## Getting started ⌨️

Using InstantSearch.js is as simple as adding this JS in your page:

```javascript
var search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  searchParameters: {
    hitsPerPage: 8
  }
});

search.addWidget(
  instantsearch.widgets.hits({
    container: document.querySelector('#products'),
    templates: {
      item: '{{{_highlightResult.name.value}}}'
    }
  })
);

search.addWidget(
  instantsearch.widgets.searchBox({
    container: document.querySelector('#searchBox'),
    placeholder: 'Search for products',
    autofocus: false /* Only to avoid live preview taking focus */
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: document.querySelector('#brand'),
    attributeName: 'brand'
  })
);

search.start();
```

You can [see this live](https://codesandbox.io/s/github/algolia/instantsearch-templates/tree/master/src/InstantSearch.js) on CodeSandbox.

If you want to learn more about the library, you
can follow the [getting started](https://community.algolia.com/instantsearch.js/v2/getting-started.html)
or check how [add it to your own project](https://community.algolia.com/instantsearch.js/v2/guides/usage.html).


## Browser support 🌍

We currently support the last two versions of major browsers. (IE10+)

## Contributing, dev, release 🚀

We welcome all contributors, from casual to regular ❤️

If you find a typo in the doc, don't hesitate to click on the `edit this page` button.

If you don't know where to start, you can check the open issue that are [tagged easy](https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A++++++%E2%9D%84%EF%B8%8F+easy%22), the [bugs](https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9D%A4+Bug%22) or [chore](https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9C%A8+Chore%22).

To get started in your contribution, you just need to:
 - fork the project and clone it locally
 - install the dependencies `yarn`
 - run the dev mode `yarn run dev` and [open dev-novel](http://localhost:8080/)

If you want to learn more about the contribution process, [read our CONTRIBUTING guide](CONTRIBUTING.md).

[logo]: https://community.algolia.com/instantsearch.js/v2/assets/img/InstantSearch-JavaScript.svg
[website]: https://community.algolia.com/instantsearch.js
[algolia-website]: https://www.algolia.com/
[react-instantsearch-github]: https://github.com/algolia/react-instantsearch/
[vue-instantsearch-github]: https://github.com/algolia/vue-instantsearch
[instantsearch-android-github]: https://github.com/algolia/instantsearch-android
[instantsearch-ios-github]: https://github.com/algolia/instantsearch-ios
[instantsearch-angular-github]: https://github.com/algolia/angular-instantsearch

