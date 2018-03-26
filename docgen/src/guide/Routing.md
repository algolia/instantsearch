---
title: Routing and URLs
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 60
---

React InstantSearch provides the necessary API entries to allow you to synchronize its state with the browser
url for example. The props you need to use are available on the [`<InstantSearch>`](guide/<InstantSearch>.html) component:

* `onSearchStateChange(nextSearchState)`: Function called every time the search state is updated.
* `searchState`: Inject a search state, turns the [`<InstantSearch>`](guide/<InstantSearch>.html) component into a [controlled component](https://facebook.github.io/react/docs/forms.html#controlled-components).
* `createURL(searchState)`: Function used by every widget generating links and passed down to every connector. You
need to return a string.

[Read the example](https://github.com/algolia/react-instantsearch/tree/master/examples/react-router) linking React InstantSearch to [react-router](https://github.com/ReactTraining/react-router).

**Notes:**
* The [search state guide](guide/Search_state.html) details all widgets and connectors search state values.
* React InstantSearch can be plugged into any history or routing library, you only have to listen for searchState
changes and inject searchState appropriately.
* Be careful when synchronizing your [search state](guide/Search_state.html) to the url bar of the browser.
Doing it too often will lead to not good back/next navigation points (one per letter) and it will slow down the overall experience. We have
experienced that browsers don't like it when we manipulate the url bar too often. We try to update the url 700ms after the last
search state event.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Virtual_widgets.html">← Virtual Widgets</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Search_parameters.html">Search parameters →</a>
    </div>
</div>
