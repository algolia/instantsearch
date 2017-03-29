---
title: Getting started
layout: main.pug
name: getting-started
category: main
withHeadings: true
navWeight: 100
---

*This guide will walk you through the few steps needed to start a project with InstantSearch Android.
We will start from an empty Android project, and create from scratch a full search interface!*

## Before we start
To use InstantSearch Android, you need an Algolia account. You can create one by clicking [here](https://www.algolia.com/users/sign_up), or use the following credentials:
- APP ID: `latency`
- Search API Key: `3d9875e51fbd20c7754e65422f7ce5e1`
- Index name: `bestbuy`

*These credentials will let you use a preloaded dataset of products appropriate for this guide.*

## Create a new Project and add InstantSearch Android
In Android Studio, create a new Project:
- On the Target screen, select **Phone and Tablet**
- On the Add an Activity screen, select **Empty Activity**

in your app's `build.gradle`, add the following dependency:
```groovy
compile 'com.algolia:instantsearch-android:0.5.1'
```

## Build the User Interface and display your data: Hits and helpers

InstantSearch Android is based on a system of [widgets][widgets] that communicate when an user interacts with your app. The first widget we'll add is **[Hits][widgets-hits]**, which will display your search results.


- To keep this guide simple, we'll replace the main activity's layout by a vertical `LinearLayout`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    android:id="@+id/activity_main"
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">
</LinearLayout>
```

<div id="itemlayout" />

- You can then add the `Hits` widget to your layout:
```xml
<com.algolia.instantsearch.ui.views.Hits
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        algolia:itemLayout="@layout/hits_item"/>
```

The `itemLayout` attribute references a layout that will be used to display each item of the results. This layout will contain a `View` for each attribute of our data that we want to display.
- Let's create a new layout called **`hits_item.xml`**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
              android:orientation="horizontal"
              android:layout_width="match_parent"
              android:layout_height="match_parent">
    <ImageView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:id="@+id/product_image"/>
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:id="@+id/product_name"/>
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:id="@+id/product_price"/>
</LinearLayout>
```

- InstantSearch Android will automatically bind your records to these Views using the [Data Binding Library][dbl].
First, enable it in your app's `build.gradle`:
```groovy
android {
    dataBinding.enabled true
    //...
}
```
- To use data binding in your layout, wrap it in a **`<layout>`** root tag.
You can then specify which View will hold each record's attribute:
add **`algolia:attribute='@{"foo"}'`** on a View to bind it to the `foo` attribute of your data:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:algolia="http://schemas.android.com/apk/res-auto">
    <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
                  android:layout_width="match_parent"
                  android:layout_height="match_parent"
                  android:orientation="horizontal">

        <ImageView
            android:id="@+id/product_image"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            algolia:attribute='@{"image"}'/>

        <TextView
            android:id="@+id/product_name"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            algolia:attribute='@{"name"}'/>

        <TextView
            android:id="@+id/product_price"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            algolia:attribute='@{"price"}'/>
    </LinearLayout>
</layout>
```
*Beware of the data binding attributes' syntax: **@'{"string"}'**.*

You have now a main activity layout containing your `Hits` widget, and a data-binding layout ready to display your search results. You just miss a search query to display its results!
As your application has no input for now, we will trigger the search programmatically.

- In your `MainActivity`, create a [`Searcher`][searcher] with your credentials:
```java
Searcher searcher = new Searcher(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, ALGOLIA_INDEX_NAME);
```

- Instantiate an [`InstantSearchHelper`][instantsearchhelper] to link your `Searcher` to your Activity:
```java
InstantSearchHelper helper = new InstantSearchHelper(this, searcher);
```

- Now your Activity is connected to Algolia through the Searcher, you can trigger a search using [`InstantSearchHelper#search(String)`][doc-instantsearch-search]:
```java
helper.search(); // Search with empty query
```

Your activity should now look like this:

```java
public class MainActivity extends AppCompatActivity {
    private static final String ALGOLIA_APP_ID = "latency";
    private static final String ALGOLIA_SEARCH_API_KEY = "3d9875e51fbd20c7754e65422f7ce5e1";
    private static final String ALGOLIA_INDEX_NAME = "bestbuy";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Searcher searcher = new Searcher(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, ALGOLIA_INDEX_NAME);
        InstantSearchHelper helper = new InstantSearchHelper(this, searcher);
        helper.search();
    }
}
```

----

<img src="assets/img/mvp/step1.png" class="img-object" align="right"/>

**Build and run your application: you now have an InstantSearch Android app displaying your data!**

<p class="cb">In this part you've learned:</p>

- How to build your interface with Widgets by adding the `Hits` widget
- How to create a data-binding `<layout>` for displaying search results
- How to initialize Algolia with your credentials
- How to trigger a search programmatically

## Search your data: the SearchBox

Your application displays search results, but for now the user cannot input anything.
This will be the role of another Widget: the **[`SearchBox`][widgets-searchbox]**.


<br />
<img src="assets/img/widget_SearchBox.png" class="img-object" align="right"/>
<br />
<br />
<br />



- Add a `SearchBox` to your `main_activity.xml`:
```xml
<com.algolia.instantsearch.ui.views.SearchBox
        android:layout_width="match_parent"
        android:layout_height="wrap_content"/>
```

InstantSearch will automatically recognize your SearchBox as a source of search queries.
Restart your app and tap a few characters: you now have a fully functional search interface!

## Help the user understand your results: Highlighting

<img src="assets/img/mvp/step2.png" class="img-object" align="right"/>

Your application lets the user search and displays results, but doesn't explain _why_ these results match the user's query.

You can improve it by using the [Highlighting][highlighting] feature: just add `algolia:highlighted="@{true}"` to every Views where the query should be highlighted:

```xml
<TextView
    android:id="@+id/product_name"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    algolia:attribute='@{"name"}'
    algolia:highlighted='@{true}'/>
```

<br />

Restart your application and type something in the SearchBox: the results are displayed with your keywords highlighted in these Views!

<!-- TODO: Add Filtering when RefinementList is a mobile-ready component
## Filter your data: the RefinementList
-->


You now know how to:
- Add a search input with the `SearchBox` widget
- Highlight search results with `algolia:highlighted`

----


## Go further

Your application now displays your data, lets your users enter a query and displays search results as-they-type: you just built an instant-search interface! Congratulations 🎉

This is only an introduction to what you can do with InstantSearch Android: have a look at our [examples][examples] to see more complex examples of applications built with InstantSearch.
You can also head to our [Widgets page][widgets] to see the other components that you could use.

[examples]: examples.html
[widgets]: widgets.html
[widgets-hits]: widgets.html#hits
[widgets-searchbox]: widgets.html#hits
[dbl]: https://developer.android.com/topic/libraries/data-binding/index.html
[searcher]: concepts.html#searcher
[instantsearchhelper]: concepts.html#instantsearchhelper
[highlighting]: widgets.html#highlighting
[doc-instantsearch-search]: javadoc/com/algolia/instantsearch/ui/InstantSearchHelper.html#search--
