---
title: Widgets
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 85
---

React InstantSearch provides a set of DOM widgets with pre-defined DOM structure and behavior.

Here's an example using the [`<SearchBox>`](widgets/SearchBox.html):

```jsx
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';

const App = () => (
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <SearchBox />
  </InstantSearch>
);
```

**Notes:**
* Find more widgets on [the API page](widgets/).
* Every widget controlling the search state expose a `defaultRefinement` prop to configure the [default
refinement](guide/Default_refinements.html) of the widget when it's mounted.
* Widgets are components that are [connected](guide/Connectors.html) to the index search context as soon
as they are mounted as children of the [`<InstantSearch>` component](guide/<InstantSearch>.html).
* Widget are not provided for react-native for now, react-native support is handled via connectors, read
the [react-native guide](guide/React_native.html).

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/<InstantSearch>.html">← &lt;InstantSearch&gt;</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Styling_widgets.html">Styling widgets →</a>
    </div>
</div>
