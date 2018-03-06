---
title: Default refinements
mainTitle: Guides
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
    <Menu attribute="fruits" defaultRefinement="Orange" />
  </InstantSearch>;
```

## Hiding default refinements

In some situations not only you want default refinements but you also do not want the user to be able to unselect them.

To do this, you can use a [`<VirtualWidget>`](guide/Virtual_widgets.html). It allows you to pre refine any widget without
rendering anything.

By default the [`<CurrentRefinements>`](widgets/CurrentRefinements.html) widget or the
[`connectCurrentRefinements`](connectors/connectCurrentRefinements.html) connector will display your default refinements. If you want to hide them, you need to filter the items with `transformItems`.

```jsx
import {InstantSearch, SearchBox, Menu} from 'react-instantsearch/dom';
import {connectMenu} from 'react-instantsearch/connectors';

const VirtualMenu = connectMenu(() => null);

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <div>
        <CurrentRefinements
           transformItems={items => items.filter(item => item.currentRefinement !== 'Orange')}
        />
        <SearchBox/>
        <VirtualMenu attribute="fruits" defaultRefinement={'Orange'} />
        <Menu attribute="origin" defaultRefinement={'Spain'} />
    </div>
  </InstantSearch>;
```

**Notes:**
* The [search state guide](guide/Search_state.html) details all widgets and connectors state values...
* Default refinements are handy when used as [Virtual widgets](guide/Virtual_widgets.html).

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Connectors.html">← Connectors</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Searching_in_Lists.html">Searching in *Lists →</a>
    </div>
</div>
