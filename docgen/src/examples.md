---
title: Examples
layout: examples.pug
name: examples
category: main
withHeadings: true
navWeight: 0
---

We made two demo applications to give you an idea of what you can build with InstantSearch Android:

## Media application
<img src="assets/img/media.gif" class="img-object" align="right"/>

This example mimics the classical video search interface, with a modal to refine your search.

- Search in **video's title**
- Filter by *number of views*, *rating*, *video quality* or *captioning*
- Automatic focus on the SearchBox
- Automatic closing of the keyboard when scrolling through the videos
- Filtering in a `DialogFragment` applied only when the users submit their final filters

<a href="https://github.com/algolia/instantsearch-android-examples/tree/master/media" class="btn btn-static-primary">See example <i class="icon icon-arrow-right"></i></a>

<br />
<br />
<br />
<br />
<br />
<br />
<br />

## E-commerce application
<img src="assets/img/ecommerce.gif" class="img-object" align="right"/>

This example imitates a product search interface like well-known e-commerce applications.

- Search in the **product's name**, **seller's name**, and **category**
- Filter by *number of views*, *rating*, *video quality* or *captioning*
- Custom views using [`AlgoliaHitView`](https://github.com/algolia/instantsearch-android/blob/master/instantsearch/src/main/java/com/algolia/instantsearch/ui/views/AlgoliaHitView.java) for displaying the promotions, ratings, ...
- Filtering in a `PopupWindow` with immediate feedback to let the user see its influence on the search results

<a href="https://github.com/algolia/instantsearch-android-examples/tree/master/ecommerce" class="btn btn-static-primary">See example <i class="icon icon-arrow-right"></i></a>

[media-url]: https://github.com/algolia/instantsearch-android-examples/tree/master/media
[ecommerce-url]: https://github.com/algolia/instantsearch-android-examples/tree/master/ecommerce
