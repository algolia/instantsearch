---
title: Default refinements
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 70
---

A frequent question that comes up is "How do I instantiate the [`<Menu>`](widgets/Menu.html)
widget with a pre selected item?".

For this, widgets and connectors expose a `defaultRefinement` prop.

The following example will instantiate a search page with a default query of "hi" and
will show a fruits menu where the item "Orange" is already selected:

```jsx
import {InstantSearch, SearchBox, Menu} from 'react-instantsearch/dom';

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <SearchBox defaultRefinement="hi" />
    <Menu attributeName="fruits" defaultRefinement="Orange" />
  </InstantSearch>;
```

**Notes:**
* The [search state guide](guide/Search_state.html) details all widgets and connectors state values.._* Default refinements are handy when used as [Virtual widgets](guide/Virtual_widgets.html).

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Connectors.html">← Connectors</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Virtual_widgets.html">Virtual Widgets →</a>
    </div>
</div>