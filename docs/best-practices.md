Best Practices
---------

This page is a placeholder for best practices we recommend you to review while implementing Vue InstantSearch.


## Custom Component

To ensure consistency and re-usability for custom components, we recommend reviewing the following guidelines.

### Styles and Classes

* As Vue InstantSearch is using `ais`, we recommend choosing a different prefix
* Do not use [`scoped`](https://vue-loader.vuejs.org/en/features/scoped-css.html) styles, it makes it very hard to override them.
* Use [BEM notation](http://getbem.com/introduction/) with only one depth level.
* Unless you are trying to ship a very opinionated styled component, just add styles for the elements that helps understanding the behaviour. i.e. for a pagination component, you will want to put in bold the current page.

### Vue component

* Use the `component` mixin that we provide. This will make sure your component can resolve the `searchStore` if not provided. It ensures the `searchStore` prop is available in your component at any time.
* If you need mutate the `searchStore` multiple times, please use `searchStore.stop()` and `searchStore.start()`, so that other components don't update their rendering on every intermediary state mutation.
* Make sure that when the component is mounted, you catch up with the `searchStore`. You can optionally mutate the state of the `searchStore` at this stage.
* When a component is `unmounted` or `destroyed`, make sure that you leave the `searchStore` in a state that does not include things you might have added (facets / filters / etc.).
* Make sure your component gracefully handles any state of the `searchStore`.

### Export UMD + ES2015

* Export your components as UMD, CommonJS and ES2015.
