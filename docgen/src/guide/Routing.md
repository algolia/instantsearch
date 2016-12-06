---
title: Routing
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 60
---

`react-instantsearch` does not automatically synchronise the search state with the URL. But you can do it
by using the props exposed by the `<InstantSearch>` component:

* onSearchStateChange(nextSearchState): Function called every time the search state is updated.
* searchState: Inject a search state, turns the `<InstantSearch>` component into a [controlled component](https://facebook.github.io/react/docs/forms.html#controlled-components).
* createURL(searchState): Function used by every widget generating links and passed down to every connector. You
need to return a string.

[Read the example](https://github.com/algolia/instantsearch.js/tree/v2/packages/react-instantsearch/examples/react-router) linking `react-instantsearch` to [react-router](https://github.com/ReactTraining/react-router).

**Notes:**
* The [search state guide](guide/State.html) details all widgets and connectors search state values.
* `react-instantsearch` can be plugged into any history or routing library, you only have to listen for searchState
changes and inject searchState appropriately.

<div class="guide-nav">
Next: <a href="guide/Search parameters.html">Search parameters →</a>
</div>
