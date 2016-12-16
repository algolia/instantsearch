---
title: Virtual widgets
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 65
---

A lot of websites have "category pages" where the search context is already refined without the user having
to do it. For example an online shop for clothes could have a page like `https://www.clothes.com/hoodies`
that shows hoodies:

```jsx
import {InstantSearch, SearchBox} from 'react-instantsearch/dom';
import {connectMenu} from 'react-instantsearch/connectors';

const VirtualMenu = connectMenu(() => null);
const Hoodies = () => <VirtualMenu attributeName="clothes" defaultRefinement="hoodies"/>;

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <SearchBox defaultRefinement="hi" />
    <Hoodies/>
    <Menu attributeName="fruits" defaultRefinement="Orange" />
  </InstantSearch>;
```

**Notes**:
* The `<Hoodies/>` component is what we call a virtual widget.
* Virtual widgets allows you to pre refine any widget without rendering anything.
* The [search state guide](guide/Search_state.html) details all widgets and connectors state values..

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Default_refinements.html">← Default Refinements</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Routing.html">Routing →</a>
    </div>
</div>
