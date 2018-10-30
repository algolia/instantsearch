---
title: InstantSearch
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 1
editable: true
githubSource: docs/src/components/InstantSearch.md
---

A wrapper component that allows you to configure the credentials and query parameters for the search.

This component automatically provides the search state to all its children.

## Usage

Basic usage:

```html
<template>
  <!-- this index-name is an example -->
  <ais-instant-search
    index-name="instant_search"
    :search-client="searchClient"
  >
    <!-- Add your InstantSearch components here. -->
  </ais-instant-search>
</template>

<!-- You need to instantiate the search client in your script -->
<script>
import algoliasearch from 'algoliasearch/lite';

export default {
  data() {
    return {
      // these credentials are an example
      searchClient: algoliasearch(
        'latency',
        '3d9875e51fbd20c7754e65422f7ce5e1'
      ),
    };
  },
};
</script>
```

## Props
Name | Type | Default | Description | Required
---|---|---|---|---
`search-client` | Object | | The instance of a search client. Usage with Algolia is done via [`algoliasearch`](https://npm.im/algoliasearch) | yes
`index-name` | String  | | The index to target for the search | yes
`searchFunction` | `(AlgoliaHelper) => void` | | A hook that will be called each time a search needs to be done, with the [helper](https://community.algolia.com/algoliasearch-helper-js/) as a parameter. It’s your responsibility to call `helper.search()`. This option allows you to avoid doing searches at page load for example. | no
`stalled-search-delay` | Number | `200`  | Time (in ms) before the search is considered unresponsive. Used to display a loading indicator. | no
`routing` | Boolean or Object | `false` | Enable the default routing feature by passing `true`. More advanced usage is documented [here](https://community.algolia.com/instantsearch.js/v2/guides/routing.html). | no
class-names | Object | `{}` | Override class names | no

## Slots

Name | Description
---|---
default | Can contain anything. All InstantSearch components are required to be inside a `ais-instant-search` component.

## CSS Classes

Class name | Description
---|---
`ais-InstantSearch` | Container class
