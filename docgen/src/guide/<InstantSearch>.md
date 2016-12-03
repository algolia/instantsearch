---
title: <InstantSearch>
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 90
---

Every `react-instantsearch` application starts by using a root `<InstantSearch>` component.

This component provides the necessary context and information to its children (widgets), letting them interact with Algolia.

As for props you will have to pass your Algolia application id, API Key and the index name to be targeted:

```jsx
import {InstantSearch} from 'react-instantsearch/dom';

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <div>
      // Use widgets here
    </div>
  </InstantSearch>;
```

**Notes:**
* Just like we have `react-instansearch/dom`, there's the corresponding `react-instansearch/native` import endpoint, use the [React native guide](/guide/React%20native.html).
* `<InstantSearch>` manages search on a single search index. We have a guide covering [multi index search and
state synchronization](Multi%20index.html).
* Internally we use [React's context](https://facebook.github.io/react/docs/context.html) to link widgets to
`<InstantSearch>`.
* You can still use any of your own components as children of `<InstantSearch>`.
* Other props are documented on the [`<InstantSearch>` API page](/widgets/InstantSearch.html).

<div class="guide-nav">
Next: <a href="/guide/Widgets.html">Widgets →</a>
</div>
