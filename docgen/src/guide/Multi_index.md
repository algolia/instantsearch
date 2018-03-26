---
title: Multi index
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 50
---

Whenever you want to:

* display hits from different indices
* share a single SearchBox
* build an autocomplete menu targeting different indices

You can use multiple [`<Index>`](widgets/<Index>.html) components.

The `<Index>` component takes one prop, the targeted index name.

When using a `<Index>` component under an `<InstantSearch>` root component you can declare widgets that will target a precise index.

Widgets that targets all the indices, like the SearchBox, should remain under the `<InstantSearch>` root component.

[Read the example](https://github.com/algolia/react-instantsearch/tree/master/examples/multi-index) displaying hits from two different indices.

You might also want to:

* Use an external autocomplete component

In this case you will need to use the [`connectAutoComplete`](connectors/connectAutoComplete.html) connectors that will give you access to:

* All the indices hits
* The current query
* The refine function to update the query

[Read the example](https://github.com/algolia/react-instantsearch/blob/master/examples/autocomplete/src/App-Multi-Index.js) using AutoSuggest to display hits from different indices.

When using the `<Index>` component the shape of the search state will be modified. See
[our Search State guide](guide/Search_state.html).

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Search_parameters.html">← Search Parameters</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Custom_connectors.html">Custom connectors →</a>
    </div>
</div>
