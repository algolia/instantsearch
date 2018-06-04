---
title: <InstantSearch>
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 90
---

Every React InstantSearch application starts by using a root `<InstantSearch>` component.

This component provides the necessary context and information to its children (widgets), letting them interact with Algolia.

As for props you will have to pass your Algolia application id, API Key and the index name to be targeted:

```jsx
import { InstantSearch } from 'react-instantsearch-dom';

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    {/* Use widgets here */}
  </InstantSearch>;
```

**Notes:**
* Just like we have `react-instantsearch-dom`, there's the corresponding `react-instantsearch-native` import endpoint, use the [React native guide](guide/React_native.html).
* `<InstantSearch>` manages search on a single search index. We have a guide covering [multi index search and
state synchronization](guide/Multi_index.html).
* Internally we use [React's context](https://facebook.github.io/react/docs/context.html) to link widgets to
`<InstantSearch>`.
* You can still use any of your own components as children of `<InstantSearch>`.
* Other props are documented on the [`<InstantSearch>` API page](widgets/<InstantSearch>.html).

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Install.html">← Install</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Widgets.html">Widgets →</a>
    </div>
</div>
