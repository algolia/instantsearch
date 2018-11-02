---
title: Migration guide
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 1
editable: true
githubSource: docs/src/getting-started/migration.md
---

## v1 -> v2

Vue InstantSearch v2 has just been released as the first alpha version. An alpha version means that there are known limitations, and this shouldn't be used in a production environment without knowing the risks of options that can be changed without major version. 

This also means that we are still in a state where things can change where necessary. If you have any feedback here, [please get in touch](https://github.com/algolia/vue-instantsearch/issues/new?template=v2_feedback.md).

### Renamed components

Some components have been renamed to be be more consistent with other InstantSearch flavours.

* `ais-results` -> `ais-hits`
* `ais-tree-menu` -> `ais-hierarchical-menu`
* `ais-clear` -> `ais-clear-refinements`
* `ais-results-per-page-selector` -> `ais-hits-per-page`
* `ais-rating` -> `ais-rating-menu`
* `ais-sort-by-selector` -> `ais-sort-by`
* `ais-index` -> `ais-instant-search`

All individual component exports have also been renamed from e.g. `SearchBox` to `AisSearchBox`. This is to make it more ergonomic to use them as components in a Vue file with the same name as expected.

The `Component` mixin has been renamed to `createWidgetMixin({ connector })`. Read more about that in the [custom component guide](/advanced/custom-components.html).

### New components

Find more information on these in their respective documentation.

1. `ais-configure`

This widget is the replacement of `query-parameters` on `ais-index`. 

2. `ais-state-results`

This component can be used for conditional rendering, and getting information that's not returned in `ais-hits`.

Note that this component was called `ais-search-state` until, and including alpha 3

3. `ais-breadcrumb`

To be used together with `ais-hierarchical-menu`.

4. `ais-menu-select`

A single-selectable menu, rendered inside a `select`

5. `ais-current-refinements`

Shows the current refinements, and allows them to be unset.

6. `ais-infinite-hits`

Replaces `:stack="true"` on `ais-results` (now called `ais-hits`).

7. `ais-numeric-menu`

Statically set numerical ranges can be used to refine using this widget.

8. `ais-panel`

Wrap a widget in `ais-panel` to be able to give it a header and a footer. Replaces those options on each widget.

9. `ais-toggle-refinement`

Toggle a boolean refinement either refined/unrefined or refinement/another refinement. Useful for toggles or buttons with two states.

### Renamed options

Some options have been renamed. Largely those are:

* attribute-name -> attribute
* result(s) -> hit(s)
* anything in a list -> items / item
* header / footer -> wrap the widget in an `ais-panel`

If you see anything not mentioned here, [please get in touch](https://github.com/algolia/vue-instantsearch/issues/new?template=v2_feedback.md).

### Removed options

* `query-parameters`

This is now handled via the Configure widget. Each query parameter becomes a prop on Configure.

* `query`

You can now synchronize the query across indices either by using a `v-model` on two `ais-search-box`es of which you hide one, or with `ais-configure` on both indices, and synchronizing between those like that.

* `appId` & `apiKey`

This is now handled by the `search-client` prop. Search client is what gets returned if you call `algoliasearch`.

```diff
  <template>
-   <ais-index
+   <ais-instant-search
-     app-id="appID"
-     api-key="apiKey"
+     :search-client="searchClient"
      index-name="myIndex"
    >
      <slot>My app</slot>
-   </ais-index>
+   </ais-instant-search>
  </template>

+ <script>
+ import algoliasearch from 'algoliasearch/lite';
+ const searchClient = algoliasearch('appID', 'apiKey');

+ export default {
+   data() {
+     return {
+       searchClient,
+     };
+   },
+ };
+ </script>
```

* `:stack="true"`

When you used to put this on `ais-results` (now called `ais-hits`), it allows to load next pages without pagination, but with a "next page" button, as well as showing all pages rather than a single one. Replaced by `ais-infinite-hits`.


### CSS class names

All CSS class names are now different, since we follow the SUIT CSS methodology now, rather than previously a slightly wrong implementation of BEM.

Since the DOM output is also different in most widgets, it's best to start styling over from scratch on these widgets.

Each widget lists the CSS classes it uses in its documentation page.

### Known limitations

1. SSR

In this alpha version there's no server side rendering support. To align this with your site which might already use SSR, you can disable that for now, by wrapping the `ais-instant-search` component in a `no-ssr` component.

The reason we chose not to enable SSR yet, is because we are looking for a elegant way of integrating it, without needing to write lots of custom code for the server side parts. 

If you're using this, and have suggestions, [please get in touch](https://github.com/algolia/vue-instantsearch/issues/new?template=v2_feedback.md).

2. Search store

The search store no longer exists. Custom widgets are either made by making a connector, or a combination of new widgets.

You no longer need to copy a widget to give it custom rendering. Now you can fill in the `default` slot, which will have everything needed to render that component.

If you're using this, and have suggestions or questions, [please get in touch](https://github.com/algolia/vue-instantsearch/issues/new?template=v2_feedback.md).


3. Routing

Routing is not fully fleshed out yet. It's possible to set the `routing` prop to `true` or an object with the options, but it doesn't integrate with Vue Router yet at this point.

If you're using this, and have suggestions, [please get in touch](https://github.com/algolia/vue-instantsearch/issues/new?template=v2_feedback.md).

4. changing props on `ais-instant-search`

It is possible to change props on `ais-instant-search`, except `routing`. If you have a need for that to be changed as well, [please get in touch](https://github.com/algolia/vue-instantsearch/issues/new?template=v2_feedback.md).
