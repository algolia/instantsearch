---
title: Widgets
layout: main.pug
name: widgets
category: main
withHeadings: true
navWeight: 2
---

## Search-Box
<img src="assets/img/widget_SearchBox.png" class="img-object" align="right" />

The **SearchBox** is a specialized `SearchView` which provides some customization options and facility methods. It supports all existing `SearchView` attributes and two new ones that you can specify in its XML definition:

```xml
<com.algolia.instantsearch.views.SearchBox
    android:id="@+id/searchBox"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:queryHint="Search"
    algolia:autofocus="true"
    algolia:submitButtonEnabled="false" />
```

- **`autofocus`**, when `true`, will make the SearchBox request the user's focus when displayed. (defaults to `false`)
- **`submitButtonEnabled`**, when `true`, will display the SearchBox with its submit button. This button is hidden by default: as every keystroke will update the results, it is usually misleading to display a submit button.

### Progress indicator
<img src="assets/img/progress.gif" class="img-object" align="right" />
<!-- TODO: Move to separate guide -->


A useful pattern to improve your user's experience consists in displaying a progress indicator when there are ongoing requests still waiting to complete.

By default, the InstantSearchHelper will display an indeterminate [`ProgressBar`](https://developer.android.com/reference/android/widget/ProgressBar.html) in your `SearchView` as long as some requests are still incomplete. This loader is shown using animations when the target device is recent enough (>= API 14), or after a small delay to avoid blinking.
You can change this delay by calling `InstantSearchHelper#enableProgressBar(int)` with a delay in milliseconds, or disable this progress indicator with `InstantSearchHelper#disableProgressBar()`.

Alternatively, you can implement your own progress logic by using a [`SearchProgressController`](https://github.com/algolia/instantsearch-android/blob/master/instantsearch/src/main/java/com/algolia/instantsearch/SearchProgressController.java).
Once instantiated, a **SearchProgressController** will inform its [`ProgressListener`](https://github.com/algolia/instantsearch-android/blob/master/instantsearch/src/main/java/com/algolia/instantsearch/SearchProgressController.java#L99) when some requests are sent with `onStart()`, and will call `onStop()` when all current requests have returned.


## Hits
<img src="assets/img/widget_Hits.png" class="img-object" align="right"/>

The **Hits** widget is made to display your search results in a flexible way. Built over a [`RecyclerView`](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.html), it displays a limited window into a large data set of search results.

This widget exposes a few attributes that you can set in its xml definition:

```xml
<com.algolia.instantsearch.views.Hits
    android:id="@+id/hits"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    algolia:autoHideKeyboard="true"
    algolia:hitsPerPage="10"
    algolia:disableInfiniteScroll="false"
    algolia:remainingItemsBeforeLoading="10"
    algolia:itemLayout="@layout/hits_item">
```

- **`autoHideKeyboard`**, when `true`, closes the keyboard when the Hits are scrolled. (defaults to `false`)
- **`hitsPerPage`** controls how many hits are requested and displayed with each search query. (defaults to 20)
- **`disableInfiniteScroll`**, when `true`, disables the [**Infinite scroll**][infinite-scroll] feature (defaults to `false`)
- **`remainingItemsBeforeLoading`** sets the minimum number of remaining hits to load the next page: if you set it to 10, the next page will be loaded when there are less than 10 items below the last visible item. (defaults to 5)
- **`itemLayout`**, finally, is used to determine the appearance of the search results.

This last attribute should reference a layout file in which you will [describe how a search result will be displayed][guide-layout]. When receiving results from its `Searcher`, this widget will bind the given layout to each result to display its attributes in the appropriate Views.

[infinite-scroll]: widgets.html#infinite-scroll
[guide-layout]: getting-started.html#itemlayout
### Data Binding

This binding is done using the [Android DataBinding Library](https://developer.android.com/topic/libraries/data-binding/index.html), which allows to link a layout to an application's data. To enable this feature, add `dataBinding.enabled true` to your app's `build.gradle` under `android`:
```groovy
android {
    dataBinding.enabled true
    //...
}
```

You can now create the hit layout. The layout file should use a `<layout></layout>` root node, followed by a regular ViewGroup (such as a `LinearLayout`). You can then describe what attributes should be mapped to each View as follows:

```xml
<layout
    xmlns:algolia="http://schemas.android.com/apk/res-auto"
    xmlns:android="http://schemas.android.com/apk/res/android">

    <RelativeLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <ImageView
            android:id="@+id/contactFace"
            style="@style/AppTheme.View.ContactImage"
            algolia:attribute='@{"img"}'/>

        <TextView
            android:id="@+id/contactCompany"
            style="@style/AppTheme.View.ContactText.Small"
            algolia:attribute='@{"company"}'/>

        <RatingBar
            android:id="@+id/contactScore"
            style="@style/AppTheme.View"
            algolia:attribute='@{"score"}'/>
    </RelativeLayout>
</layout>
```

For each `View` which should receive a result's attribute, you can specify `algolia:attribute='@{"foo"}'` to map the record's `foo` attribute to this View.

Currently, the Hits widget handles natively the following Views and their subclasses:


|View Class | Use of the attribute | Method called | Notes|
| --------- | -------------------- | ------------- | ---- |
|TextView   | text content | setText(attributeValue) | Can be highlighted
|EditText   | hint content | setHint(attributeValue) | Can be highlighted
|ImageView  | bitmap image URL | setBitmapImage(attributeBitmap)| Parsed to an URL, then loaded asynchronously
|RatingBar  | rating value| setRating(attributeValue)| Parsed as Float
|ProgressBar| progress value | setProgress(attributeValue)| Parsed as Float and rounded to the nearest Integer

### Custom hit views

Apart from these ones, any `View` can be used to hold an attribute if it implements the [`AlgoliaHitView`](/instantsearch/src/main/java/com/algolia/instantsearch/ui/views/AlgoliaHitView.java) interface. In this case, we will call `onUpdateView(JSONObject result)` and the view will be responsible of using the result's JSON to display the hit.

*See for example the [media app][media-url]'s [`TimestampHitView`](https://github.com/algolia/instantsearch-android-examples/blob/master/media/src/main/java/com/algolia/instantsearch/examples/media/views/TimestampHitView.java), a TextView which transforms a timestamp attribute to display a human-readable date instead.*

### Infinite scroll

An infinite scroll mechanism is built-in to load more results as the user scrolls.
Enabled by default, it will watch the state of the Hits to load more results before the user reaches the end of the current page.

As explained [in the attributes description](#hits), you can use the attributes `remainingItemsBeforeLoading` and `disableInfiniteScroll` to control or disable this feature.

### Empty View

The Hits widget implements an empty view mechanism to display an alternative View if there are no results to display, following the [AdapterView's interface](https://developer.android.com/reference/android/widget/AdapterView.html#setEmptyView(android.view.View)).
If you add a View to your layout with the id **`@android:id/empty`**, it will be displayed instead of the Hits when there is no data to display.  You can also set it programmatically using `Hits#setEmptyView(View)`.

### Highlighting
<img src="assets/img/highlighting.png" class="img-object" align="right"/>

Visually highlighting the search result is [an essential feature of a great search interface][explain-highlighting]. It will help your users understand your results by explaining them why a result is relevant to their query.

The `Hits` widget automatically handles highlighting. To highlight a textual attribute, simply add the `highlighted` attribute on its view:

```xml
<TextView
    android:id="@+id/name"
    algolia:attribute='@{"city"}'
    algolia:highlighted="@{true}"/>
```
This will highlight the attribute according to the query term, like you can see in the screenshot. The color used by default for highlighting is `R.color.colorHighlighting`, which you can override in your application.

You can also specify `algolia:highlightingColor='@{"color/appDefinedColor"}'` on a `View` to use a specific color for this one only.

Note that highlighting **only works automatically on TextViews**. if you implement a [custom hit view](#custom-hit-views) or to highlight results received by your [custom widget](#anatomy-of-an-algoliawidget), you should use the [`Highlighter`](javadoc/com/algolia/instantsearch/helpers/Highlighter.html).
This tool will let you build a highlighted [`Spannable`](https://developer.android.com/reference/android/text/Spannable.html) from a search result and an optional highlight color:

```java
final Spannable highlightedAttribute = Highlighter.getDefault().renderHighlightColor(result, attributeToHighlight, context);
```

The default Highlighter will highlight anything between `<em>` and `</em>`. You can configure the Highlighter to highlight between any pair of terms with `Highlighter.setDefault(newPrefix, newSuffix)`, or use a RegExp pattern to highlight any captured part with `Highlighter.setDefault(newPattern)`.

*See for example the [e-commerce app][ecommerce-url]'s [`CategoryOrTypeView`](https://github.com/algolia/instantsearch-android-examples/blob/master/ecommerce/src/main/java/com/algolia/instantsearch/examples/ecommerce/views/CategoryOrTypeView.java), a TextView which takes either the `category` or the `type` attribute of a record and [highlights it](https://github.com/algolia/instantsearch-android-examples/blob/master/ecommerce/src/main/java/com/algolia/instantsearch/examples/ecommerce/views/CategoryOrTypeView.java#L25) before displaying.*


## RefinementList
<img src="assets/img/widget_RefinementList.png" class="img-object" align="right"/>

The **RefinementList** is a filtering widget made to display your [facets](https://www.algolia.com/doc/guides/search/filtering-faceting#faceting) and let the user refine the search results.

Four attributes allow you to configure how it will filter your results:

```xml
<com.algolia.instantsearch.views.RefinementList
            android:id="@+id/refinements"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            algolia:attribute="city"
            algolia:limit="10"
            algolia:operator="or"
            algolia:sortBy="['isRefined', 'count:desc']"/>
```

- **`attribute`** defines which faceted attribute will be used by the widget.
- **`operator`** can either be `"or"` or `"and"`, to control if the results should match *any* selected value or *all* selected values. (defaults to `"or"`)
- **`limit`** is the maximum amount of facet values we will display (defaults to 10). If there are more values, we will display those with the bigger counts.
- **`sortBy`** controls the sort order of the attributes. You can either specify a single value or an array of values to apply one after another.

  This attribute accepts the following values:
  - `"isRefined"` to sort the facets by displaying first currently refined facets
  - `"count:asc"` to sort the facets by increasing count
  - `"count:desc"` to sort the facets by decreasing count
  - `"name:asc"` to sort the facet values by alphabetical order
  - `"name:desc"` to sort the facet values by reverse alphabetical order

In the previous code sample, `sortBy="['isRefined', 'count']"` will display the refined facets before the non-refined ones, and will then sort them by decreasing count.

## Stats
<img src="assets/img/widget_Stats.png" class="img-object" align="right"/>

**Stats** is a widget for displaying statistics about the current search result. You can configure it with two attributes:

```xml
<com.algolia.instantsearch.views.Stats
            android:id="@+id/stats"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            algolia:resultTemplate="{nbHits} results found in {processingTimeMS} ms"
            algolia:errorTemplate="Error, please try again"/>
```
- **`resultTemplate`** defines what this widget will display when a search request returns successfully. It takes the form of a templated string where we will replace the following templates:
  - `{nbHits}` will be replaced by the hit count for the current query
  - `{processingTimeMS}` will be replaced by the time the server took to process the request, in milliseconds
  - `{hitsPerPage}` will be replaced by the maximum number of hits returned per page
  - `{nbPages}` will be replaced by the number of pages corresponding to the number of hits
  - `{page}` will be replaced by the index of the current page (zero-based)
  - `{query}` will be replaced by the query text

  The default `resultTemplate` is `"{nbHits} results found in {processingTimeMS} ms"`.

- **`errorTemplate`** defines what this widget will display when a search query returns with an error. It takes the form of a templated string where we will replace the following templates:
  - `{error}` will be replaced by the error message
  - `{query}` will be replaced by the query text

  If you don't specify an `errorTemplate`, the Stats widget will be hidden when a query returns an error.

## Custom widgets

If none of these widgets fits your use-case, you can implement your own!

Any `View` implementing the [`AlgoliaResultsListener`](javadoc/com/algolia/instantsearch/model/AlgoliaResultsListener.html) interface will be picked-up by `InstantSearchHelper` at instantiation. You simply need to implement two methods:
- `onResults` will be called when new results are received
- `onError` will be called when there is an error

This interface also specifies `setSearcher`, to give a reference to the `Searcher` used in your search interface. It will enable your widget to uses the [Searcher's programmatic API][docs-searcher].

[media-url]: https://github.com/algolia/instantsearch-android-examples/tree/master/media
[ecommerce-url]: https://github.com/algolia/instantsearch-android-examples/tree/master/ecommerce
[explain-highlighting]: https://www.algolia.com/doc/faq/searching/what-is-the-highlighting/
[docs-searcher]: /javadoc/com/algolia/instantsearch/helpers/Searcher.html
