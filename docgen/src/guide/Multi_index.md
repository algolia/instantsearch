---
title: Multi index
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 50
---

You can use multiple `<InstantSearch/>` instances for cases like:

* displaying hits from different indices
* sharing a single SearchBox
* any use case involving synchronizing widgets between different `<InstantSearch>` instances

Two props on the [InstantSearch component](widgets/InstantSearch.html) can be used to inject searchState or be notified of searchState changes:

* onSearchStateChange(onSearchStateChange): a function being called every time the `<InstantSearch>` searchState is updated.
* [searchState](guide/Search_state.html): a search state

The idea is to have a main component that will receive every new search state of the first instance
and then pass it back to each `<InstantSearch>` instances.

Refinements and parameters of an `<InstantSearch>` searchState needs to have their corresponding widgets or
[virtual widget](guide/Virtual_widgets.html) added to be effectively applied.

[Read the example](https://github.com/algolia/instantsearch.js/tree/v2/packages/react-instantsearch/examples/multi-index) displaying hits from two different indices.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Search_parameters.html">← Search Parameters</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Custom_connectors.html">Custom connectors →</a>
    </div>
</div>