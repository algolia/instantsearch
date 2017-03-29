---
title: Main Concepts
layout: main.pug
name: concepts
category: main
withHeadings: true
navWeight: 10
---

**InstantSearch Android** is a library providing widgets and helpers to help you build the best instant-search experience on Android with Algolia.
It is built on top of Algolia's [Android API Client](https://github.com/algolia/algoliasearch-client-android) to provide you a high-level solution to quickly build various search interfaces.


In this guide, you will learn the key concepts of InstantSearch Android.


## Searcher

The main component of InstantSearch Android is the **Searcher**, which will wrap an [Algolia API `Client`](https://github.com/algolia/algoliasearch-client-android/blob/master/algoliasearch/src/main/java/com/algolia/search/saas/Client.java) and provide a level of abstraction over it.

The Searcher is responsible of all search requests: when `Searcher#search()` is called, the Searcher will fire a request with the current query, and will forward the search results to its **listeners**.

```java
                                    ┌-> A implements AlgoliaResultsListener
Searcher.search(query) -> algolia --┤
                                    └-> B implements AlgoliaResultsListener
```


### Listeners
A listener is an object implementing the [`AlgoliaResultsListener`](instantsearch/src/main/java/com/algolia/instantsearch/model/AlgoliaResultsListener.java) interface: this object's `onResults` or `onError` method will be called after each search request returns to let you either process the results or handle the error. You can add a listener to a Searcher by calling `Searcher#registerListener()`.


```java
                ┌→ (error) onError(final Query query, final AlgoliaException error);
new Search -> -─┤
                └→ (success) onResults(SearchResults results, boolean isLoadingMore);
```

## InstantSearchHelper

The Searcher is UI-agnostic, and only communicates with its listeners. On top of it, we provide you a component which will link it to your user interface: the **InstantSearchHelper**.

The InstantSearchHelper will use the Searcher to react to changes in your application's interface, like when your user types a new query or interacts with Widgets.

Linked to a `SearchView`, it will watch its content to send any new query to the `Searcher`. When the query's results arrive, the `InstantSearchHelper` will forward them to its `AlgoliaWidgets`.


```java
        SearchView.onQueryTextListener.onQueryTextChange()
                               │
                               ↓
             searcher.search(searchView.getQuery())
                               │
            ┌──────────────────┴──────────────────┐
            ↓                                     ↓
Widget1.onResults(hits, isLoadingMore) Widget2.onResults(hits, isLoadingMore)
```

## Widgets

Widgets are the UI building blocks of InstantSearch Android, linked together by an `InstantSearchHelper` to help you build instant-search interfaces. We provide some universal widgets such as the **`SearchBox`**, the **`Hits`** or the **`RefinementList`**, and you can easily create new ones by implementing the [`AlgoliaWidget`](instantsearch/src/main/java/com/algolia/instantsearch/ui/views/AlgoliaWidget.java) interface.

### Anatomy of an `AlgoliaWidget`

An **`AlgoliaWidget`** is a specialization of the `AlgoliaResultsListener` interface used by the `Searcher` to notify its listeners of search results.  
Beyond reacting to search results with `onResults` and to errors in `onError`, an `AlgoliaWidget` exposes an `onReset` method which will be called when the interface is reset (which you can trigger via `InstantSearchHelper#reset()`).
When linked to a `Searcher`, the widget's `setSearcher` method will be called to provide it a reference to its Searcher, which is useful to some widgets. For example, the `Hits` widget uses it to load more results as the user scrolls.

## Events

InstantSearch comes with an event system that lets you react during the lifecycle of a search query:
- when a query is fired via a `SearchEvent(Query query, int requestSeqNumber)`
- when its results arrive via a `ResultEvent(JSONObject content, Query query, int requestSeqNumber)`
- when a query is cancelled via a `CancelEvent(Request request, Integer requestSeqNumber)`
- when a request errors via a `ErrorEvent(AlgoliaException error, Query query, int requestSeqNumber)`

We use EventBus to dispatch events. You can register an object to the event bus using `EventBus.getDefault().register(this);` after which it will receive events on methods annotated by `@Subscribe`:

```java
public class Logger {
    Logger() {
        EventBus.getDefault().register(this);
    }

    @Subscribe
    onSearchEvent(SearchEvent e) {
        Log.d("Logger", "Search:" + e.query);
    }

    @Subscribe
    onResultEvent(ResultEvent e) {
        Log.d("Logger", "Result:" + e.query);
    }
}
```

