---
title: Widgets
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 85
---

`react-instantsearch` provides a set of DOM widgets with pre-defined DOM structure and behavior.

Here's an example using the [`<SearchBox>`](widgets/SearchBox.html):

```jsx
import {InstantSearch, SearchBox} from 'react-instantsearch/dom';

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <div>
      <SearchBox />
    </div>
  </InstantSearch>;
```

**Notes:**
* Find more widgets on [the API page](widgets/).
* Every widget controlling the search state expose a `defaultRefinement` prop to configure the [default
refinement](guide/Default%20refinements.html) of the widget when it's mounted.
* Widgets are components that are [connected](guide/Connectors.html) to the index search context as soon
as they are mounted as children of the [`<InstantSearch>` component](guide/<InstantSearch>.html).
* Widget are not provided for react-native for now, react-native support is handled via connectors, read
the [react-native guide](guide/React%20native.html).

<div class="guide-nav">
Next: <a href="guide/Styling widgets.html">Styling widgets →</a>
</div>
