---
title: Migration Guide - Package import
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 10
---

With the release of the version `5.2.0`, we completely revamped the architecture of the package while keeping it backward compatible. The only case **where changes are required** is when you are using the private imports:

```js
// Still works with `react-instantsearch` ≥ `5.2.0`
import { InstantSearch } from 'react-instantsearch/dom';

// Doesn't work with `react-instantsearch` ≥ `5.2.0`
import { InstantSearch } from 'react-instantsearch/es/widgets/SearchBox';
```

We never documented the latter although it was handy to use; the default import was not compatible with [tree shaking](https://webpack.js.org/guides/tree-shaking). For this reason, we decided to update our package **to be compatible with tree shaking by default**. To achieve this, we chose to publish three new packages:

- `react-instantsearch-core`: contains all the core logic of React InstantSearch
- `react-instantsearch-dom`: contains the DOM specific widgets and components
- `react-instantsearch-native`: contains the React Native specific widgets and components

The `react-instantsearch-core` package is used internally by the two others. You don't need to use this package on its own most of the time. You might want to use it for a new "binding". We only support [React DOM][react-website] and [React Native][react-native-website] but the core package is not tied to any rendering engine. It means that you can create your own binding for [React 360][react-360-website] for example.

This split also allows using the correct [`peerDependencies`](https://nodejs.org/en/blog/npm/peer-dependencies/) for each package. It was not the case previously because the package was the target of both [React DOM][react-website] and [React Native][react-native-website]. You can now have a clear vision about which version of React the package depends on:

- `react-instantsearch-core`: has a peer dependency on `react ≥ 15.3.0 < 17`
- `react-instantsearch-dom`: has a peer dependency on `react ≥ 15.3.0 < 17` and `react-dom ≥ 15.3.0 < 17`
- `react-instantsearch-native`: has a peer dependency on `react ≥ 15.3.0 < 17` and `react-native ≥ 0.32.0`

As this new architecture is backward compatible, we encourage all our users to update to the new package. We recommend doing so because the library is correctly tree shaken with [Webpack](https://webpack.js.org) ≥ 4. Here are some metrics about the two different versions:

|    | **Create React App + Webpack 3** | **Webpack 4**
| - | :---: | :---: |
| `react-instantsearch/dom` (CJS) | 108 kB | 104 kB
| `react-instantsearch-dom` (ESM) | 105 kB (-2.7%) | **87 kB (-16.3%)**

> The sizes are after gzip. The sample application uses: Configure, SearchBox, ClearRefinements, RefinementList, Hits, Custom Hits (with connectHits), Pagination.

The package `react-instantsearch` is deprecated in favor of `react-instantsearch-dom` and `react-instantsearch-native`.

## Migration for React DOM

The first step is to remove the package `react-instantsearch`:

```sh
yarn remove react-instantsearch
```

The second step is to install the package `react-instantsearch-dom`:

```sh
yarn add react-instantsearch-dom
```

The last step is to update all your imports to the new package:

```js
// With `react-instantsearch`
import { createConnector } from 'react-instantsearch';
import { InstantSearch } from 'react-instantsearch/dom';
import { connectMenu } from 'react-instantsearch/connectors';
import { createInstantSearch } from 'react-instantsearch/server';

// With `react-instantsearch-dom`
import { createConnector, InstantSearch, connectMenu } from 'react-instantsearch-dom';
import { createInstantSearch } from 'react-instantsearch-dom/server';
```

## Migration for React Native

The first step is to remove the package `react-instantsearch`:

```sh
yarn remove react-instantsearch
```

The second step is to install the package `react-instantsearch-native`:

```sh
yarn add react-instantsearch-native
```

The last step is to update all your imports to the new package:

```js
// with `react-instantsearch`
import { createConnector } from 'react-instantsearch';
import { InstantSearch } from 'react-instantsearch/native';
import { connectMenu } from 'react-instantsearch/connectors';

// with `react-instantsearch-native`
import { createConnector, InstantSearch, connectMenu } from 'react-instantsearch-native';
```

[react-website]: https://reactjs.org
[react-native-website]: https://facebook.github.io/react-native
[react-360-website]: https://facebook.github.io/react-360
