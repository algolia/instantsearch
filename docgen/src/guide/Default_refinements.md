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

## What if I want some default refinements to be hidden?

Another frequent question that comes up is "How do I preselect some refinements but hide them in a way that it can't be
unselected?".

For this, you can use a [`<VirtualWidgets/>`](guide/Virtual_widgets.html). It allows you to pre refine any widget without
rendering anything. If you don't want a default refinement to be removed but you are using
the [`<CurrentRefinements/>`](widgets/CurrentRefinements.html) widget or the
[`connectCurrentRefinements`](connectors/connectCurrentRefinements.html) connector to display all the others,
then you should use the `transformItems` props to filters the one you don't want.

The following example will instantiate a search page that will show results
that are oranges, a search box and a menu to select the oranges origin:

```jsx
import {InstantSearch, SearchBox, Menu} from 'react-instantsearch/dom';
import {connectMenu} from 'react-instantsearch/connectors';
import {filter} from 'lodash';

const VirtualMenu = connectMenu(() => null);

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <div>
        <CurrentRefinements
           transformItems={items => filter(items, item => item.currentRefinement !== 'Orange')}
        />
        <SearchBox/>
        <VirtualMenu attributeName="fruits" defaultRefinement={'Orange'} />
        <Menu attributeName="origin" defaultRefinement={'Spain'} />
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
        Next: <a href="guide/Search_for_facet_values.html">Search for facet values →</a>
    </div>
</div>