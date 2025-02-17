---
layout: documentation.pug
title: Reference
---

## AlgoliaSearchHelper

The `AlgoliaSearchHelper` is the main interface of the Helper library. It lets you set the parameters for the search and retrieve information during the search cycle with events:

- `change`: when a parameter is set or updated
- `search`: when the search is sent to Algolia
- `result`: when the results are retrieved from Algolia
- `error`: when Algolia sends back an error
- `searchQueueEmpty`: when there is no more pending searches
- `searchForFacetValues`: when a search is sent to Algolia using `searchForFacetValues`
- `searchOnce`: when a search is sent to Algolia using `searchOnce`

You can also read the current parameters of the search using the AlgoliaSearchHelper but it might not be the one you expect according to the last results received.

### Instantiate

{{> jsdoc jsdoc/main/algoliasearchHelper}}

### Search

Like the client, the sole purpose of the helper is to make search queries to Algolia.

There are two ways to generate a query to Algolia.

- The first one, using `search`, triggers the events and all its parameters come directly from the internal search parameters inside the Helper.
- The second one, using `searchOnce`, is to be used for one-shot searches that won't influence the rest of the app. It lets you change the parameters before sending the query.

Most of the searches will be done using the first method because it implements a mechanism that ensure that the answers process will never be outdated. For example, if you do two searches close one to another and if the network is not reliable, you might end up having the second search results before the first one. This can't happend when using the event based method, that's why it is prefered.

You can also search into the values of the facets using `searchForFacetValues`. This method can be called in the same way that `searchOnce`.

Finally, you can retrieve if there is an on-going search with `hasPendingRequests` or by listening to the `searchQueueEmpty` event.

{{> jsdoc jsdoc/helper/search}}

{{> jsdoc jsdoc/helper/searchOnce}}

{{> jsdoc jsdoc/helper/searchForFacetValues}}

{{> jsdoc jsdoc/helper/hasPendingRequests}}

{{> jsdoc jsdoc/helper/clearCache}}

### Derive / multi-queries

{{> jsdoc jsdoc/helper/derive}}

### Query and index

{{> jsdoc jsdoc/helper/setQuery}}

{{> jsdoc jsdoc/helper/setIndex}}

{{> jsdoc jsdoc/helper/getIndex}}

### Pagination

{{> jsdoc jsdoc/helper/setPage}}

{{> jsdoc jsdoc/helper/getPage}}

### Query parameters

Those methods let you set any query parameters from Algolia. See the full list of parameters that can be in the [rest API documentation](https://www.algolia.com/doc/rest#query-an-index).

Before using those methods, be sure to check [the shortcuts](query-parameters-shortcuts).

{{> jsdoc jsdoc/helper/setQueryParameter}}

### Conjunctive Facets

Conjunctive facets are used to filter values from a facetted attribute. The filters set on an attribute are combined using an `and`, hence the conjunctive adjective.

If we have a dataset of movies, and we have an array of genre for each movie, we can then do the following:

```javascript
// helper is already configured
helper.addFacetRefinement('film-genre', 'comedy');
helper.addFacetRefinement('film-genre', 'science-fiction');

// the filters are equals to
// film-genre = comedy AND film-genre = science-fiction
```

#### Configuration

The conjunctive facets that will be used in the implementation need to be declared at the initialization of the helper, this way:

```javascript
var helper = AlgoliasearchHelper(client, indexName, {
  facets: ['nameOfTheAttribute'],
});
```

The values that can be used for filtering are retrieved with the answer from Algolia. They are accessible using the [getFacetValues](#SearchResults#getFacetValues) methods on the [SearchResults](#SearchResults) object.

#### Methods

{{> jsdoc jsdoc/helper/clearRefinements}}

{{> jsdoc jsdoc/helper/addFacetRefinement}}

{{> jsdoc jsdoc/helper/removeFacetRefinement}}

{{> jsdoc jsdoc/helper/toggleFacetRefinement}}

{{> jsdoc jsdoc/helper/hasRefinements}}

{{> jsdoc jsdoc/helper/getRefinements}}

### Disjunctive facets

Disjunctive facets are used to filter values from a facetted attribute. The filters set on an attribute are combined using an `or`, hence the disjunctive adjective.

If we have a dataset of TV's, and we have an attribute that defines the kind of tech used, we can then do the following:

```javascript
// helper is already configured
helper.addDisjunctiveFacetRefinement('tech', 'crt');
helper.addDisjunctiveFacetRefinement('tech', 'led');
helper.addDisjunctiveFacetRefinement('tech', 'plasma');

// the filters are equals to
// tech = crt OR tech = led OR tech = plasma
```

#### Configuration

The disjunctive facets that will be used in the implementation need to be declared at the initialization of the helper, this way:

```javascript
var helper = AlgoliasearchHelper(client, indexName, {
  disjunctiveFacets: ['nameOfTheAttribute'],
});
```

The values that can be used for filtering are retrieved with the answer from Algolia. They are accessible using the [getFacetValues](#SearchResults#getFacetValues) methods on the [SearchResults](#SearchResults) object.

#### Methods

{{> jsdoc jsdoc/helper/clearRefinements}}

{{> jsdoc jsdoc/helper/addDisjunctiveFacetRefinement}}

{{> jsdoc jsdoc/helper/removeDisjunctiveFacetRefinement}}

{{> jsdoc jsdoc/helper/hasRefinements}}

### Hierarchical facets

Hierarchical facets are useful to build such navigation menus:

```sh
| products
  > fruits
    > citrus
    | strawberries
    | peaches
    | apples
```

Here, we refined the search this way:

- click on fruits
- click on citrus

#### Usage

To build such menu, you need to use hierarchical faceting:

```javascript
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [
    {
      name: 'products',
      attributes: ['categories.lvl0', 'categories.lvl1'],
    },
  ],
});
```

Given your objects looks like this:

```json
{
  "objectID": "123",
  "name": "orange",
  "categories": {
    "lvl0": "fruits",
    "lvl1": "fruits > citrus"
  }
}
```

And you refine `products`:

```js
helper.toggleFacetRefinement('products', 'fruits > citrus');
```

You will get a hierarchical presentation of your facet values: a navigation menu of your facet values.

```js
helper.on('result', function (event) {
  console.log(event.results.hierarchicalFacets[0]);
  // {
  //   'name': 'products',
  //   'count': null,
  //   'isRefined': true,
  //   'path': null,
  //   'data': [{
  //     'name': 'fruits',
  //     'path': 'fruits',
  //     'count': 1,
  //     'isRefined': true,
  //     'data': [{
  //       'name': 'citrus',
  //       'path': 'fruits > citrus',
  //       'count': 1,
  //       'isRefined': true,
  //       'data': null
  //     }]
  //   }]
  // }
});
```

To ease navigation, we always:

- provide the root level categories
- provide the current refinement sub categories (`fruits > citrus > *`: n + 1)
- provide the parent refinement (`fruits > citrus` => `fruits`: n -1) categories
- refine the search using the current hierarchical refinement

#### Multiple values per level

Your records can also share multiple categories between one another by using arrays inside your object:

```json
{
  "objectID": "123",
  "name": "orange",
  "categories": {
    "lvl0": ["fruits", "color"],
    "lvl1": ["fruits > citrus", "color > orange"]
  }
},
{
  "objectID": "456",
  "name": "grapefruit",
  "categories": {
    "lvl0": ["fruits", "color", "new"],
    "lvl1": ["fruits > citrus", "color > yellow", "new > citrus"]
  }
}
```

#### Specifying another separator

```js
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [
    {
      name: 'products',
      attributes: ['categories.lvl0', 'categories.lvl1'],
      separator: '|',
    },
  ],
});

helper.toggleFacetRefinement('products', 'fruits|citrus');
```

Would mean that your objects look like so:

```json
{
  "objectID": "123",
  "name": "orange",
  "categories": {
    "lvl0": "fruits",
    "lvl1": "fruits|citrus"
  }
}
```

#### Specifying a different sort order for values

The default sort for the hierarchical facet view is: `isRefined:desc (first show refined), name:asc (then sort by name)`.

You can specify a different sort order by using:

```js
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [
    {
      name: 'products',
      attributes: ['categories.lvl0', 'categories.lvl1'],
      sortBy: ['count:desc', 'name:asc'], // first show the most common values, then sort by name
    },
  ],
});
```

The available sort tokens are:

- count
- isRefined
- name
- path

#### Restrict results and hierarchical values to non-root level

Let's say you have a lot of levels:

```
- fruits
  - yellow
    - citrus
      - spicy
```

But you only want to get the values starting at "citrus", you can use `rootPath`

You can specify an root path to filter the hierarchical values

```
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [{
    name: 'products',
    attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3'],
    rootPath: 'fruits > yellow > citrus'
  }]
});
```

Having a rootPath will refine the results on it **automatically**.

#### Hide parent level of current parent level

By default the hierarchical facet is going to return the child and parent facet values of the current refinement.

If you do not want to get the parent facet values you can set showParentLevel to false

```js
var helper = algoliasearchHelper(client, indexName, {
  hierarchicalFacets: [
    {
      name: 'products',
      attributes: ['categories.lvl0', 'categories.lvl1'],
      showParentLevel: false,
    },
  ],
});
```

#### Methods

{{> jsdoc jsdoc/helper/addHierarchicalFacetRefinement}}

{{> jsdoc jsdoc/helper/getHierarchicalFacetBreadcrumb}}

{{> jsdoc jsdoc/helper/removeHierarchicalFacetRefinement}}

{{> jsdoc jsdoc/helper/toggleFacetRefinement}}

### Facet exclusions

The facet exclusions are not a type of facets by themselves, they are conjunctive facets. The following set of methods let you specify wich value not to keep in the results. See the [conjunctive facets](#conjunctive-facets) for more information on how to configure them.

{{> jsdoc jsdoc/helper/addFacetExclusion}}

{{> jsdoc jsdoc/helper/removeFacetExclusion}}

{{> jsdoc jsdoc/helper/toggleFacetExclusion}}

{{> jsdoc jsdoc/helper/hasRefinements}}

### Numeric filters

The numeric filters don't require any configuration. However they require that the attribute is stored as a number in Algolia.

{{> jsdoc jsdoc/helper/addNumericRefinement}}

{{> jsdoc jsdoc/helper/removeNumericRefinement}}

{{> jsdoc jsdoc/helper/getNumericRefinement}}

### Tag filters

The tag filters don't require any configuration. However, they require to be stored in the `_tags` attribute in Algolia.

{{> jsdoc jsdoc/helper/clearTags}}

{{> jsdoc jsdoc/helper/addTag}}

{{> jsdoc jsdoc/helper/removeTag}}

{{> jsdoc jsdoc/helper/toggleTag}}

{{> jsdoc jsdoc/helper/getTags}}

### State management

{{> jsdoc jsdoc/helper/setState}}

{{> jsdoc jsdoc/helper/overrideStateWithoutTriggeringChangeEvent}}

### Events

{{> jsdoc jsdoc/helper/event:change}}

{{> jsdoc jsdoc/helper/event:search}}

{{> jsdoc jsdoc/helper/event:result}}

{{> jsdoc jsdoc/helper/event:error}}

{{> jsdoc jsdoc/helper/event:searchQueueEmpty}}

{{> jsdoc jsdoc/helper/event:searchOnce}}

{{> jsdoc jsdoc/helper/event:searchForFacetValues}}

### Client management

{{> jsdoc jsdoc/helper/getClient}}

{{> jsdoc jsdoc/helper/setClient}}

## SearchResults

The SearchResults is the interface to read the results received from Algolia search API. Most of the data is accessible directly through properties. The exception being the data used for the features that are implemented on top of Algolia API such as faceting.

### Results

{{> jsdoc jsdoc/results/hits}}

### Facets and filters methods

{{> jsdoc jsdoc/results/getFacetValues}}

{{> jsdoc jsdoc/results/getFacetStats}}

{{> jsdoc jsdoc/results/getRefinements}}

### Geolocation data

{{> jsdoc jsdoc/results/aroundLatLng}}

{{> jsdoc jsdoc/results/automaticRadius}}

### Results metadata

{{> jsdoc jsdoc/results/hitsPerPage}}

{{> jsdoc jsdoc/results/nbHits}}

{{> jsdoc jsdoc/results/nbPages}}

### Parameters

{{> jsdoc jsdoc/results/index}}

{{> jsdoc jsdoc/results/query}}

{{> jsdoc jsdoc/results/page}}

{{> jsdoc jsdoc/results/parsedQuery}}

### Query rules

{{> jsdoc jsdoc/results/userData}}

### Technical metadata

{{> jsdoc jsdoc/results/processingTimeMS}}

{{> jsdoc jsdoc/results/serverUsed}}

{{> jsdoc jsdoc/results/exhaustiveFacetsCount}}

{{> jsdoc jsdoc/results/exhaustiveNbHits}}

## Types

The helper structures the way the data is sent and retrieved from the Algolia API. Here is the list of those common structure that you might encounter in the documentation.

{{> jsdoc jsdoc/helper/FacetRefinement}}

{{> jsdoc jsdoc/helper/NumericRefinement}}

{{> jsdoc jsdoc/helper/FacetSearchResult}}

{{> jsdoc jsdoc/helper/FacetSearchHit}}

{{> jsdoc jsdoc/results/Facet}}

{{> jsdoc jsdoc/results/FacetValue}}

{{> jsdoc jsdoc/results/HierarchicalFacet}}

{{> jsdoc jsdoc/results/Refinement}}

{{> jsdoc jsdoc/state/clearCallback}}

{{> jsdoc jsdoc/state/FacetList}}

{{> jsdoc jsdoc/state/OperatorList}}

## SearchParameters

The SearchParameters is the class that structures all the parameters that are needed to build a query to Algolia.

The SearchParameters instances are usually referred to as the state of the search. This state is available when receiving `change` and `search` events, and with `result` as a secondary parameter. Alternatively, it can be retrieved using `helper.state`.

SearchParameter is an immutable class. Each setter method returns a new instance with the modification, and does not modify the object it is called on.

### Attributes

The SearchParameters stores all the parameters to make the queries to Algolia. They can be of two types:

- raw parameters. Those parameters are sent directly to Algolia without any transformation. Like the query or any configuration that you can find in the [Rest API documentation](https://www.algolia.com/doc/rest-api/search#list-indexes).
- managed parameters. Those parameters are structured inside the SearchParameters in a way that makes them easy to use with a programmatic API. But those are not native to Algolia.

All the attributes specific to the helper are described below:

{{> jsdoc jsdoc/state/disjunctiveFacets}}

{{> jsdoc jsdoc/state/disjunctiveFacetsRefinements}}

{{> jsdoc jsdoc/state/facets}}

{{> jsdoc jsdoc/state/facetsExcludes}}

{{> jsdoc jsdoc/state/facetsRefinements}}

{{> jsdoc jsdoc/state/hierarchicalFacets}}

{{> jsdoc jsdoc/state/hierarchicalFacetsRefinements}}

{{> jsdoc jsdoc/state/numericRefinements}}

{{> jsdoc jsdoc/state/tagRefinements}}

### Methods

{{> jsdoc jsdoc/state/addDisjunctiveFacet}}

{{> jsdoc jsdoc/state/addDisjunctiveFacetRefinement}}

{{> jsdoc jsdoc/state/addExcludeRefinement}}

{{> jsdoc jsdoc/state/addFacet}}

{{> jsdoc jsdoc/state/addFacetRefinement}}

{{> jsdoc jsdoc/state/addHierarchicalFacet}}

{{> jsdoc jsdoc/state/addHierarchicalFacetRefinement}}

{{> jsdoc jsdoc/state/addNumericRefinement}}

{{> jsdoc jsdoc/state/addTagRefinement}}

{{> jsdoc jsdoc/state/clearRefinements}}

{{> jsdoc jsdoc/state/clearTags}}

{{> jsdoc jsdoc/state/getConjunctiveRefinements}}

{{> jsdoc jsdoc/state/getDisjunctiveRefinements}}

{{> jsdoc jsdoc/state/getExcludeRefinements}}

{{> jsdoc jsdoc/state/getHierarchicalFacetBreadcrumb}}

{{> jsdoc jsdoc/state/getHierarchicalFacetByName}}

{{> jsdoc jsdoc/state/getHierarchicalRefinement}}

{{> jsdoc jsdoc/state/getNumericRefinements}}

{{> jsdoc jsdoc/state/getNumericRefinement}}

{{> jsdoc jsdoc/state/getRefinedDisjunctiveFacets}}

{{> jsdoc jsdoc/state/getRefinedHierarchicalFacets}}

{{> jsdoc jsdoc/state/getUnrefinedDisjunctiveFacets}}

{{> jsdoc jsdoc/state/isConjunctiveFacet}}

{{> jsdoc jsdoc/state/isDisjunctiveFacetRefined}}

{{> jsdoc jsdoc/state/isDisjunctiveFacet}}

{{> jsdoc jsdoc/state/isExcludeRefined}}

{{> jsdoc jsdoc/state/isFacetRefined}}

{{> jsdoc jsdoc/state/isHierarchicalFacetRefined}}

{{> jsdoc jsdoc/state/isHierarchicalFacet}}

{{> jsdoc jsdoc/state/isNumericRefined}}

{{> jsdoc jsdoc/state/isTagRefined}}

{{> jsdoc jsdoc/state/make}}

{{> jsdoc jsdoc/state/removeExcludeRefinement}}

{{> jsdoc jsdoc/state/removeFacet}}

{{> jsdoc jsdoc/state/removeFacetRefinement}}

{{> jsdoc jsdoc/state/removeDisjunctiveFacet}}

{{> jsdoc jsdoc/state/removeDisjunctiveFacetRefinement}}

{{> jsdoc jsdoc/state/removeHierarchicalFacet}}

{{> jsdoc jsdoc/state/removeHierarchicalFacetRefinement}}

{{> jsdoc jsdoc/state/removeTagRefinement}}

{{> jsdoc jsdoc/state/setDisjunctiveFacets}}

{{> jsdoc jsdoc/state/setFacets}}

{{> jsdoc jsdoc/state/setHitsPerPage}}

{{> jsdoc jsdoc/state/setPage}}

{{> jsdoc jsdoc/state/setQueryParameters}}

{{> jsdoc jsdoc/state/setQueryParameter}}

{{> jsdoc jsdoc/state/setQuery}}

{{> jsdoc jsdoc/state/setTypoTolerance}}

{{> jsdoc jsdoc/state/toggleDisjunctiveFacetRefinement}}

{{> jsdoc jsdoc/state/toggleExcludeFacetRefinement}}

{{> jsdoc jsdoc/state/toggleConjunctiveFacetRefinement}}

{{> jsdoc jsdoc/state/toggleHierarchicalFacetRefinement}}

{{> jsdoc jsdoc/state/toggleFacetRefinement}}

{{> jsdoc jsdoc/state/toggleTagRefinement}}

{{> jsdoc jsdoc/state/validate}}
