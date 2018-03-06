---
title: Virtual widgets
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 65
---

A lot of websites have "category pages" where the search context is already refined without the user having
to do it. This allows for the search results to be constrained to only the specific results that you would like to display.
For example an online shop for clothes could have a page like `https://www.clothes.com/hoodies`
that shows hoodies and only hoodies:

```jsx
import {InstantSearch, SearchBox} from 'react-instantsearch/dom';
import {connectMenu} from 'react-instantsearch/connectors';

const VirtualMenu = connectMenu(() => null);
const Hoodies = () => <VirtualMenu attribute="clothes" defaultRefinement="hoodies"/>;

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <SearchBox defaultRefinement="hi" />
    <Hoodies/>
    <Menu attribute="fruits" defaultRefinement="Orange" />
  </InstantSearch>;
```
In this case, we are using the `VirtualMenu` to pre refine our results (within the `clothes` search, only display `hoodies`). Think of the `VirtualMenu` as a hidden filter where we define attributes and values that will always be applied to our search results

**Notes**:
* The `<Hoodies>` component is what we call a virtual widget.
* Virtual widgets allow you to pre refine any widget without rendering anything.
* The [search state guide](guide/Search_state.html) details all widgets and connectors state values..

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Search_for_facet_values.html">← Search for facet values</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Routing.html">Routing →</a>
    </div>
</div>
