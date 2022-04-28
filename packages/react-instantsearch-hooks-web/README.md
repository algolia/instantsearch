# react-instantsearch-hooks-web

React InstantSearch Hooks Web is an open-source React library that lets you create an instant search result experience using [Algolia][algolia-website]’s search API. It is part of the InstantSearch family:

**React InstantSearch** | [InstantSearch.js][instantsearch.js-github] | [Angular InstantSearch][instantsearch-angular-github] | [Vue InstantSearch][instantsearch-vue-github] | [InstantSearch Android][instantsearch-android-github] | [InstantSearch iOS][instantsearch-ios-github]

## Why

You should be using React InstantSearch Hooks Web if you want to:

* Design search experiences with best practices
* Customize your components at will
* Follow React principles

## Installation

React InstantSearch is available on the npm registry. It relies on [`algoliasearch`](https://github.com/algolia/algoliasearch-client-javascript) to communicate with Algolia APIs.

```sh
yarn add algoliasearch react-instantsearch-hooks-web
# or
npm install algoliasearch react-instantsearch-hooks-web
```

## Getting started

Using React InstantSearch Hooks Web is as simple as adding these components to your app:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-hooks-web';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const App = () => (
  <InstantSearch
    indexName="bestbuy"
    searchClient={searchClient}
  >
    <SearchBox />
    <Hits />
  </InstantSearch>
);
```

<p align="center">
  <a href="https://codesandbox.io/s/github/algolia/react-instantsearch/tree/master/examples/hooks" title="Edit on CodeSandbox">
    <img alt="Edit on CodeSandbox" src="https://codesandbox.io/static/img/play-codesandbox.svg">
  </a>
</p>

To learn more about the library, follow the [getting started guide][doc-getting-started].

## Documentation

The documentation is available on [algolia.com/doc][doc].

## Playground

You can get to know React InstantSearch on [this playground][doc-playground].

Start by [adding components][doc-getting-started] and tweaking the display. Once you get more familiar with the library, you can learn more advanced concepts in [our guides][doc-guides].

## Contributing

We welcome all contributors, from casual to regular. You are only one command away to start the developer environment, [read our CONTRIBUTING guide](https://github.com/algolia/react-instantsearch/blob/master/CONTRIBUTING.md).

## License

React InstantSearch Hooks is [MIT licensed](../../LICENSE).

<!-- Links -->

[doc]: https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react-hooks/
[doc-getting-started]: https://www.algolia.com/doc/guides/building-search-ui/getting-started/react-hooks/
[doc-guides]: https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react-hooks/
[doc-playground]: https://codesandbox.io/s/github/algolia/react-instantsearch/tree/master/examples/hooks
[algolia-website]: https://www.algolia.com/
[instantsearch.js-github]: https://github.com/algolia/instantsearch.js
[instantsearch-android-github]: https://github.com/algolia/instantsearch-android
[instantsearch-ios-github]: https://github.com/algolia/instantsearch-ios
[instantsearch-vue-github]: https://github.com/algolia/vue-instantsearch
[instantsearch-angular-github]: https://github.com/algolia/angular-instantsearch
