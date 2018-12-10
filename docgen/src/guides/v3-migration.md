---
title: Upgrade to InstantSearch 3
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 0
editable: true
githubSource: docgen/src/guides/v3-migration.md
---

This document helps you migrate from InstantSearch 2 to InstantSearch 3.

InstantSearch 3 introduces some breaking changes in the widgets' naming, options and markup.

## InstantSearch

### `appId` and `apiKey` are replaced by `searchClient`

#### Previous usage

1.  [Import `InstantSearch.js`](https://community.algolia.com/instantsearch.js/v2/getting-started.html#install-instantsearchjs)
2.  Initialize InstantSearch

```javascript
const search = instantsearch({
  indexName: 'indexName',
  appId: 'appId',
  apiKey: 'apiKey',
});

search.start();
```

#### New usage

1.  [Import `algoliasearch`](https://www.algolia.com/doc/api-client/javascript/getting-started/) (prefer the [lite version](https://github.com/algolia/algoliasearch-client-javascript#search-onlylite-client) for search only)
2.  [Import `InstantSearch.js`](https://community.algolia.com/instantsearch.js/v2/getting-started.html#install-instantsearchjs)
3.  Initialize InstantSearch with the `searchClient` option

```javascript
const search = instantsearch({
  indexName: 'indexName',
  searchClient: algoliasearch('appId', 'apiKey'),
});

search.start();
```

### `transformData` is replaced by `transformItems`

Since InstantSearch.js first public release, we have provided an option to customize the values used in the widgets. This method was letting you map 1-1 the values with other values. With React Instantsearch, we implemented a slightly different API that allows to map over the list of values and to change their content.

#### Previous usage

```javascript
search.addWidget(
  instantsearch.widget.refinementList({
    container: '#facet',
    attributeName: 'facet',
    transformData: {
      item: data => {
        data.count = 0;
        return data;
      },
    },
  })
);
```

#### New usage

```javascript
search.addWidget(
  instantsearch.widget.refinementList({
    container: '#facet',
    attributeName: 'facet',
    transformItems: items =>
      items.map(item => ({
        ...item,
        count: 0,
      })),
  })
);
```

### `instantsearch.highlight` and `instantsearch.snippet`

One powerful feature to demonstrate to users why a result matched their query is highlighting. InstantSearch was relying on some internals to support this inside the template of the widgets (see below). We now have two dedicated helpers to support both highlighting and snippetting. You can find more information about that [inside their documentation](LINK_NEW_DOC_).

#### Previous usage

```javascript
search.addWidget(
  instantsearch.widget.hits({
    container: '#hits',
    templates: {
      item: '{{{ _highlightResult.name.value }}}',
    },
  })
);
```

#### New usage

```javascript
search.addWidget(
  instantsearch.widget.hits({
    container: '#hits',
    templates: {
      item: '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
    },
  })
);
```

### `urlSync` is dropped

If you were previously using the `urlSync` option, you should now migrate to the new `routing` feature.

Here are the elements you need to migrate:

- `urlSync: true` becomes `routing: true`
- `threshold` becomes `routing: { router: instantsearch.routers.history({ writeDelay: 400 }) }`
- `mapping` and `trackedParameters` are replaced with `stateMapping`. Read "[User friendly URLs](routing.html#user-friendly-urls)" to know how to configure it
- `useHash` is removed but can be achieved using an advanced configuration of the [history router](routing.html#history-router-api)
- `getHistoryState` is removed but can be achieved using an advanced configuration of the [history router](routing.html#history-router-api)

### `collapsible` is dropped

`collapsible` is replaced by the `panel` widget.

### `autoHideContainer` is dropped

`autoHideContainer` is replaced by the `panel` widget.

### `createAlgoliaClient` is dropped

`createAlgoliaClient` is replaced by `searchClient`.

### `createQueryString` is dropped

URL synchronization is done via Routing alone now.

## Widgets

### Breadcrumb

#### CSS classes

| Before                          | After                           |
| ------------------------------- | ------------------------------- |
| `ais-breadcrumb`                | `ais-Breadcrumb`                |
|                                 | `ais-Breadcrumb--noRefinement`  |
| `ais-breadcrumb`                | `ais-Breadcrumb-list`           |
| `ais-breadcrumb--separator`     | `ais-Breadcrumb-separator`      |
| `ais-breadcrumb--label`         | `ais-Breadcrumb-link`           |
| `ais-breadcrumb--disabledLabel` |                                 |
|                                 | `ais-Breadcrumb-item`           |
|                                 | `ais-Breadcrumb-item--selected` |

#### Markup

```html
<div class="ais-Breadcrumb">
  <ul class="ais-Breadcrumb-list">
    <li class="ais-Breadcrumb-item">
      <a class="ais-Breadcrumb-link" href="#">Home</a>
    </li>
    <li class="ais-Breadcrumb-item">
      <span class="ais-Breadcrumb-separator" aria-hidden="true">></span>
      <a class="ais-Breadcrumb-link" href="#">Cooking</a>
    </li>
    <li class="ais-Breadcrumb-item ais-Breadcrumb-item--selected">
      <span class="ais-Breadcrumb-separator" aria-hidden="true">></span>
      Kitchen textiles
    </li>
  </ul>
</div>
```

### ClearRefinements (formerly ClearAll)

#### Options

| Before              | After                |
| ------------------- | -------------------- |
| `excludeAttributes` | `excludedAttributes` |

#### CSS classes

| Before                | After                                   |
| --------------------- | --------------------------------------- |
| `ais-clear-all`       | `ais-ClearRefinements`                  |
| `ais-clear-all--body` |                                         |
| `ais-clear-all--link` |                                         |
|                       | `ais-ClearRefinements-button`           |
|                       | `ais-ClearRefinements-button--disabled` |

#### Markup

```html
<div class="ais-ClearRefinements">
  <button class="ais-ClearRefinements-button">
    Clear refinements
  </button>
</div>
```

### CurrentRefinements (formerly CurrentRefinedValues)

#### Options

| Before                 | After                             |
| ---------------------- | --------------------------------- |
| `attributes`           | `includedAttributes`              |
|                        | `excludedAttributes`              |
| `onlyListedAttributes` | use `includedAttributes`          |
| `clearsQuery`          | use `excludedAttributes`          |
| `clearAll`             | use the `clearRefinements` widget |

- `clearsQuery` can replaced by `excludedAtributes: []`.

#### CSS classes

| Before                                  | After                                  |
| --------------------------------------- | -------------------------------------- |
| `ais-current-refined-values`            | `ais-CurrentRefinements`               |
| `ais-current-refined-values--list`      | `ais-CurrentRefinements-list`          |
| `ais-current-refined-values--item`      | `ais-CurrentRefinements-item`          |
| `ais-current-refined-values--link`      | `ais-CurrentRefinements-label`         |
| `ais-current-refined-values--count`     |                                        |
|                                         | `ais-CurrentRefinements-category`      |
|                                         | `ais-CurrentRefinements-categoryLabel` |
|                                         | `ais-CurrentRefinements-delete`        |
|                                         | `ais-CurrentRefinements-query`         |
| `ais-current-refined-values--clear-all` |                                        |

#### Markup

##### Default

```html
<div class="ais-CurrentRefinements">
  <ul class="ais-CurrentRefinements-list">
    <li class="ais-CurrentRefinements-item">
      <span class="ais-CurrentRefinements-label">
        Category:
      </span>
      <span class="ais-CurrentRefinements-category">
        <span class="ais-CurrentRefinements-categoryLabel">Movies & TV Shows</span>
        <button class="ais-CurrentRefinements-delete">✕</button>
      </span>
      <span class="ais-CurrentRefinements-category">
        <span class="ais-CurrentRefinements-categoryLabel">Others</span>
        <button class="ais-CurrentRefinements-delete">✕</button>
      </span>
    </li>
  </ul>
</div>
```

##### With `includesQuery` and a query

```html
<div class="ais-CurrentRefinements">
  <ul class="ais-CurrentRefinements-list">
    <li class="ais-CurrentRefinements-item">
      <span class="ais-CurrentRefinements-label">
        Category:
      </span>
      <span class="ais-CurrentRefinements-category">
        <span class="ais-CurrentRefinements-categoryLabel">Movies & TV Shows</span>
        <button class="ais-CurrentRefinements-delete">✕</button>
      </span>
      <span class="ais-CurrentRefinements-category">
        <span class="ais-CurrentRefinements-categoryLabel">Others</span>
        <button class="ais-CurrentRefinements-delete">✕</button>
      </span>
    </li>
    <li class="ais-CurrentRefinements-item">
      <span class="ais-CurrentRefinements-label">
        Query:
      </span>
      <span class="ais-CurrentRefinements-category">
        <span class="ais-CurrentRefinements-categoryLabel">
          <q>My query</q>
        </span>
        <button class="ais-CurrentRefinements-delete">✕</button>
      </span>
    </li>
  </ul>
</div>
```

### GeoSearch

#### Options

#### Options

| Before                      | After                                                  |
| --------------------------- | ------------------------------------------------------ |
| `customHTMLMarker.template` | `templates.HTMLMarker`                                 |
| `paddingBoundingBox`        | Removed                                                |
| `enableGeolocationWithIP`   | Removed - use the Configure widget instead (see below) |
| `position`                  | Removed - use the Configure widget instead (see below) |
| `radius`                    | Removed - use the Configure widget instead (see below) |
| `precision`                 | Removed - use the Configure widget instead (see below) |

- `paddingBoundingBox` was in conflict with the `routing` option - so we removed it to support URLSync for the GeoSearch widget.

#### `enableGeolocationWithIP`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  enableGeolocationWithIP: true,
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundLatLngViaIP: true,
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

#### `position`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  position: { lat: 40.71, lng: -74.01 },
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundLatLng: '40.71, -74.01',
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

#### `radius`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  radius: 1000,
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundRadius: 1000,
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

#### `precision`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  precision: 1000,
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundPrecision: 1000,
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

#### CSS classes

| Before                                | After                           |
| ------------------------------------- | ------------------------------- |
| `ais-geo-search`                      | `ais-GeoSearch`                 |
| `ais-geo-search--map`                 | `ais-GeoSearch-map`             |
| `ais-geo-search--controls`            | `ais-GeoSearch-tree`            |
| `ais-geo-search--control`             | `ais-GeoSearch-control`         |
| `ais-geo-search--toggle-label`        | `ais-GeoSearch-label`           |
| `ais-geo-search--toggle-label-active` | `ais-GeoSearch-label--selected` |
| `ais-geo-search--toggle-inpit`        | `ais-GeoSearch-input`           |
| `ais-geo-search--redo`                | `ais-GeoSearch-redo`            |
|                                       | `ais-GeoSearch-redo--disabled`  |
| `ais-geo-search--clear`               | `ais-GeoSearch-reset`           |

#### Markup

With the control element:

```html
<div class="ais-GeoSearch">
  <div class="ais-GeoSearch-map">
    <!-- Map element here -->
  </div>
  <div class="ais-GeoSearch-tree">
    <div class="ais-GeoSearch-control">
      <label class="ais-GeoSearch-label">
        <input class="ais-GeoSearch-input" type="checkbox">
        Search as I move the map
      </label>
    </div>
    <button class="ais-GeoSearch-reset">
      Clear the map refinement
    </button>
  </div>
</div>
```

With the redo button:

```html
<div class="ais-GeoSearch">
  <div class="ais-GeoSearch-map">
    <!-- Map element here -->
  </div>
  <div class="ais-GeoSearch-tree">
    <div class="ais-GeoSearch-control">
      <button class="ais-GeoSearch-redo">
        Redo search here
      </button>
    </div>
    <button class="ais-GeoSearch-reset">
      Clear the map refinement
    </button>
  </div>
</div>
```

### Hits

#### Options

| Before          | After           |
| --------------- | --------------- |
| `escapeHits`    | `escapeHTML`    |
| `showMoreLabel` | `loadMoreLabel` |

- `escapeHTML` becomes `true` by default.
- `allItems` template has been removed in favor of `connectHits`

#### CSS classes

| Before            | After             |
| ----------------- | ----------------- |
| `ais-hits`        | `ais-Hits`        |
| `ais-hits--empty` | `ais-Hits--empty` |
|                   | `ais-Hits--list`  |
| `ais-hits--item`  | `ais-Hits--item`  |

#### Markup

```html
<div class="ais-Hits">
  <ol class="ais-Hits-list">
    <li class="ais-Hits-item">
      Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
    </li>
    <li class="ais-Hits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-Hits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-Hits-item">
      Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
    </li>
    <li class="ais-Hits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-Hits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-Hits-item">
      Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
    </li>
    <li class="ais-Hits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
  </ol>
</div>
```

### HitPerPage (formerly HitsPerPageSelector)

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

#### CSS classes

| Before                       | After                    |
| ---------------------------- | ------------------------ |
|                              | `ais-HitsPerPage`        |
| `ais-hits-per-page-selector` | `ais-HitsPerPage-select` |
| `ais-hits-per-page--item`    | `ais-HitsPerPage-option` |

#### Markup

```html
<div class="ais-HitsPerPage">
  <select class="ais-HitsPerPage-select">
    <option class="ais-HitsPerPage-option" value="3">3 per page</option>
    <option class="ais-HitsPerPage-option" value="6">6 per page</option>
  </select>
</div>
```

### InfiniteHits

#### Options

| Before          | After                    |
| --------------- | ------------------------ |
| `escapeHits`    | `escapeHTML`             |
| `loadMoreLabel` | `templates.showMoreText` |

- `escapeHTML` defaults to `true`

#### CSS classes

| Before                              | After                                 |
| ----------------------------------- | ------------------------------------- |
| `ais-infinite-hits`                 | `ais-InfiniteHits`                    |
| `ais-infinite-hits--empty`          | `ais-InfiniteHits--empty`             |
|                                     | `ais-InfiniteHits--list`              |
| `ais-infinite-hits--item`           | `ais-InfiniteHits--item`              |
| `ais-infinite-hits--showmore`       |                                       |
| `ais-infinite-hits--showmoreButton` | `ais-InfiniteHits-loadMore`           |
|                                     | `ais-InfiniteHits-loadMore--disabled` |

#### Markup

```html
<div class="ais-InfiniteHits">
  <ol class="ais-InfiniteHits-list">
    <li class="ais-InfiniteHits-item">
      Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
    </li>
    <li class="ais-InfiniteHits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-InfiniteHits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-InfiniteHits-item">
      Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
    </li>
    <li class="ais-InfiniteHits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-InfiniteHits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
    <li class="ais-InfiniteHits-item">
      Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
    </li>
    <li class="ais-InfiniteHits-item">
      Hit 4397400: Google - Chromecast - Black
    </li>
  </ol>

  <button class="ais-InfiniteHits-loadMore">Show more results</button>
```

### Hierarchical Menu

#### Options

| Before | After           |
| ------ | --------------- |
|        | `showMore`      |
|        | `showMoreLimit` |

#### CSS classes

| Before                                | After                                     |
| ------------------------------------- | ----------------------------------------- |
| `ais-hierarchical-menu`               | `ais-HierarchicalMenu`                    |
|                                       | `ais-HierarchicalMenu--noRefinement`      |
|                                       | `ais-HierarchicalMenu-searchBox`          |
| `ais-hierarchical-menu--list`         | `ais-HierarchicalMenu-list`               |
|                                       | `ais-HierarchicalMenu-list--child`        |
|                                       | `ais-HierarchicalMenu-list--lvl0`         |
|                                       | `ais-HierarchicalMenu-list--lvl1`         |
| `ais-hierarchical-menu--item`         | `ais-HierarchicalMenu-item`               |
| `ais-hierarchical-menu--item__active` | `ais-HierarchicalMenu-item--selected`     |
| `ais-hierarchical-menu--item__parent` | `ais-HierarchicalMenu-item--parent`       |
| `ais-hierarchical-menu--link`         | `ais-HierarchicalMenu-link`               |
| `ais-hierarchical-menu--label`        | `ais-HierarchicalMenu-label`              |
| `ais-hierarchical-menu--count`        | `ais-HierarchicalMenu-count`              |
| `ais-hierarchical-menu--noResults`    | `ais-HierarchicalMenu-noResults`          |
|                                       | `ais-HierarchicalMenu-showMore`           |
|                                       | `ais-HierarchicalMenu-showMore--disabled` |

#### Markup

##### Default

```html
<div class="ais-HierarchicalMenu">
  <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0">
    <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected">
      <a class="ais-HierarchicalMenu-link" href="#">
        <span class="ais-HierarchicalMenu-label">Appliances</span>
        <span class="ais-HierarchicalMenu-count">4,306</span>
      </a>
      <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child ais-HierarchicalMenu-list--lvl1">
        <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
          <a class="ais-HierarchicalMenu-link" href="#">
            <span class="ais-HierarchicalMenu-label">Dishwashers</span>
            <span class="ais-HierarchicalMenu-count">181</span>
          </a>
        </li>
        <li class="ais-HierarchicalMenu-item">
          <a class="ais-HierarchicalMenu-link" href="#">
            <span class="ais-HierarchicalMenu-label">Fans</span>
            <span class="ais-HierarchicalMenu-count">91</span>
          </a>
        </li>
      </ul>
    </li>
    <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
      <a class="ais-HierarchicalMenu-link" href="#">
        <span class="ais-HierarchicalMenu-label">Audio</span>
        <span class="ais-HierarchicalMenu-count">1,570</span>
      </a>
    </li>
  </ul>
  <button class="ais-HierarchicalMenu-showMore">Show more</button>
</div>
```

##### Show more disabled

```html
<div class="ais-HierarchicalMenu">
  <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0">
    <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected">
      <a class="ais-HierarchicalMenu-link" href="#">
        <span class="ais-HierarchicalMenu-label">Appliances</span>
        <span class="ais-HierarchicalMenu-count">4,306</span>
      </a>
      <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child ais-HierarchicalMenu-list--lvl1">
        <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
          <a class="ais-HierarchicalMenu-link" href="#">
            <span class="ais-HierarchicalMenu-label">Dishwashers</span>
            <span class="ais-HierarchicalMenu-count">181</span>
          </a>
        </li>
        <li class="ais-HierarchicalMenu-item">
          <a class="ais-HierarchicalMenu-link" href="#">
            <span class="ais-HierarchicalMenu-label">Fans</span>
            <span class="ais-HierarchicalMenu-count">91</span>
          </a>
        </li>
      </ul>
    </li>
    <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
      <a class="ais-HierarchicalMenu-link" href="#">
        <span class="ais-HierarchicalMenu-label">Audio</span>
        <span class="ais-HierarchicalMenu-count">1,570</span>
      </a>
    </li>
  </ul>
  <button class="ais-HierarchicalMenu-showMore ais-HierarchicalMenu-showMore--disabled" disabled>Show more</button>
</div>
```

### Menu

#### Options

| Before                        | After                        |
| ----------------------------- | ---------------------------- |
| `attributeName`               | `attribute`                  |
| `showMore.limit`              | `showMoreLimit`              |
| `showMore.templates.active`   | `templates.showMoreText`     |
| `showMore.templates.inactive` | `templates.showMoreText`     |

- `showMore` is now a boolean option (`showMore.templates` are now in `templates`)
- `sortBy` defaults to `['isRefined', 'name:asc']`
- An object containing `isShowingMore` is passed to `showMoreText` template to toggle between the two states:

```
{
  showMoreText: `
    {{#isShowingMore}}
      Show less
    {{/isShowingMore}}
    {{^isShowingMore}}
      Show more
    {{/isShowingMore}}
  `
}
```

#### CSS classes

| Before                   | After                         |
| ------------------------ | ----------------------------- |
| `ais-menu`               | `ais-Menu`                    |
| `ais-menu--list`         | `ais-Menu-list`               |
| `ais-menu--item`         | `ais-Menu-item`               |
| `ais-menu--item__active` | `ais-Menu-item--selected`     |
| `ais-menu--link`         | `ais-Menu-link`               |
|                          | `ais-Menu-label`              |
| `ais-menu--count`        | `ais-Menu-count`              |
|                          | `ais-Menu-noResults`          |
|                          | `ais-Menu-showMore`           |
|                          | `ais-Menu-showMore--disabled` |

#### Markup

##### Default

```html
<div class="ais-Menu">
  <ul class="ais-Menu-list">
    <li class="ais-Menu-item ais-Menu-item--selected">
      <a class="ais-Menu-link" href="#">
        <span class="ais-Menu-label">Appliances</span>
        <span class="ais-Menu-count">4,306</span>
      </a>
    </li>
    <li class="ais-Menu-item">
      <a class="ais-Menu-link" href="#">
        <span class="ais-Menu-label">Audio</span>
        <span class="ais-Menu-count">1,570</span>
      </a>
    </li>
  </ul>
  <button class="ais-Menu-showMore">Show more</button>
</div>
```

##### Show more disabled

```html
<div class="ais-Menu">
  <ul class="ais-Menu-list">
    <li class="ais-Menu-item ais-Menu-item--selected">
      <a class="ais-Menu-link" href="#">
        <span class="ais-Menu-label">Appliances</span>
        <span class="ais-Menu-count">4,306</span>
      </a>
    </li>
    <li class="ais-Menu-item">
      <a class="ais-Menu-link" href="#">
        <span class="ais-Menu-label">Audio</span>
        <span class="ais-Menu-count">1,570</span>
      </a>
    </li>
  </ul>
  <button class="ais-Menu-showMore ais-Menu-showMore--disabled" disabled>Show more</button>
</div>
```

### MenuSelect

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

#### CSS classes

| Before                    | After                          |
| ------------------------- | ------------------------------ |
| `ais-menu-select`         | `ais-MenuSelect`               |
|                           | `ais-MenuSelect--noRefinement` |
| `ais-menu-select--select` | `ais-MenuSelect-select`        |
| `ais-menu-select--option` | `ais-MenuSelect-option`        |
| `ais-menu-select--header` |                                |
| `ais-menu-select--footer` |                                |

#### Markup

```html
<div class="ais-MenuSelect">
  <select class="ais-MenuSelect-select">
    <option class="ais-MenuSelect-option" value="Appliances">Appliances (4306)</option>
    <option class="ais-MenuSelect-option" value="Audio">Audio (1570)</option>
  </select>
</div>
```

### NumericMenu (formerly NumericRefinementList)

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |
| `options`       | `items`     |

The item `name` attribute is now named `label`.

#### CSS classes

| Before                              | After                            |
| ----------------------------------- | -------------------------------- |
| `ais-refinement-list`               | `ais-NumericMenu`                |
|                                     | `ais-NumericMenu--noRefinement`  |
| `ais-refinement-list--list`         | `ais-NumericMenu-list`           |
| `ais-refinement-list--item`         | `ais-NumericMenu-item`           |
| `ais-refinement-list--item__active` | `ais-NumericMenu-item--selected` |
| `ais-refinement-list--label`        | `ais-NumericMenu-label`          |
| `ais-refinement-list--radio`        | `ais-NumericMenu-radio`          |
|                                     | `ais-NumericMenu-labelText`      |

#### Markup

```html
<div class="ais-NumericMenu">
  <ul class="ais-NumericMenu-list">
    <li class="ais-NumericMenu-item ais-NumericMenu-item--selected">
      <label class="ais-NumericMenu-label">
        <input class="ais-NumericMenu-radio" type="radio" name="NumericMenu" checked="" />
        <span class="ais-NumericMenu-labelText">All</span>
      </label>
    </li>
    <li class="ais-NumericMenu-item">
      <label class="ais-NumericMenu-label">
        <input class="ais-NumericMenu-radio" type="radio" name="NumericMenu" />
        <span class="ais-NumericMenu-labelText">Less than 500</span>
      </label>
    </li>
  </ul>
</div>
```

### NumericSelector

Widget removed.

### Pagination

#### Options

| Before            | After                  |
| ----------------- | ---------------------- |
| `maxPages`        | `totalPages`           |
| `showFirstLast`   | `showFirst` `showLast` |
|                   | `showNext`             |
|                   | `showPrevious`         |
| `labels`          | `templates`            |
| `labels.previous` | `templates.previous`   |
| `labels.next`     | `templates.next`       |
| `labels.first`    | `templates.first`      |
| `labels.last`     | `templates.last`       |

#### CSS classes

| Before                           | After                               |
| -------------------------------- | ----------------------------------- |
|                                  | `ais-Pagination`                    |
|                                  | `ais-Pagination--noRefinement`      |
| `ais-pagination`                 | `ais-Pagination-list`               |
| `ais-pagination--item`           | `ais-Pagination-item`               |
| `ais-pagination--item__first`    | `ais-Pagination-item--firstPage`    |
| `ais-pagination--item__last`     | `ais-Pagination-item--lastPage`     |
| `ais-pagination--item__previous` | `ais-Pagination-item--previousPage` |
| `ais-pagination--item__next`     | `ais-Pagination-item--nextPage`     |
|                                  | `ais-Pagination-item--page`         |
| `ais-pagination--item__active`   | `ais-Pagination-item--selected`     |
| `ais-pagination--item__disabled` | `ais-Pagination-item--disabled`     |
| `ais-pagination--link`           | `ais-Pagination-link`               |

#### Markup

```html
<div class="ais-Pagination">
  <ul class="ais-Pagination-list">
    <li class="ais-Pagination-item ais-Pagination-item--firstPage ais-Pagination-item--disabled">
      <span class="ais-Pagination-link" aria-label="Previous">‹‹</span>
    </li>
    <li class="ais-Pagination-item ais-Pagination-item--previousPage ais-Pagination-item--disabled">
      <span class="ais-Pagination-link" aria-label="Previous">‹</span>
    </li>
    <li class="ais-Pagination-item ais-Pagination-item--selected">
      <a class="ais-Pagination-link" href="#">1</a>
    </li>
    <li class="ais-Pagination-item ais-Pagination-item--page">
      <a class="ais-Pagination-link" href="#">2</a>
    </li>
    <li class="ais-Pagination-item ais-Pagination-item--page">
      <a class="ais-Pagination-link" href="#">3</a>
    </li>
    <li class="ais-Pagination-item">
      <a class="ais-Pagination-link" href="#">4</a>
    </li>
    <li class="ais-Pagination-item ais-Pagination-item--nextPage">
      <a class="ais-Pagination-link" aria-label="Next" href="#">›</a>
    </li>
    <li class="ais-Pagination-item ais-Pagination-item--lastPage">
      <a class="ais-Pagination-link" aria-label="Next" href="#">››</a>
    </li>
  </ul>
</div>
```

### PriceRanges

Widget removed.

### RangeInput

#### Options

| Before             | After                     |
| ------------------ | ------------------------- |
| `attributeName`    | `attribute`               |
| `labels`           | `templates`               |
| `labels.separator` | `templates.separatorText` |
| `labels.submit`    | `templates.submitText`    |

#### CSS classes

| Before                       | After                          |
| ---------------------------- | ------------------------------ |
| `ais-range-input`            | `ais-RangeInput`               |
|                              | `ais-RangeInput--noRefinement` |
| `ais-range-input--body`      |                                |
| `ais-range-input--form`      | `ais-RangeInput-form`          |
| `ais-range-input--fieldset`  |                                |
|                              | `ais-RangeInput-label`         |
| `ais-range-input--labelMin`  |                                |
| `ais-range-input--labelMax`  |                                |
|                              | `ais-RangeInput-input`         |
| `ais-range-input--inputMin`  | `ais-RangeInput-input--min`    |
| `ais-range-input--inputMax`  | `ais-RangeInput-input--max`    |
| `ais-range-input--separator` | `ais-RangeInput-separator`     |
| `ais-range-input--submit`    | `ais-RangeInput-submit`        |

#### Markup

```html
<div class="ais-RangeInput">
  <form class="ais-RangeInput-form">
    <label class="ais-RangeInput-label">
      <input class="ais-RangeInput-input ais-RangeInput-input--min" type="number" />
    </label>

    <span class="ais-RangeInput-separator">to</span>

    <label class="ais-RangeInput-label">
      <input class="ais-RangeInput-input ais-RangeInput-input--max" type="number" />
    </label>

    <button class="ais-RangeInput-submit" type="submit">Go</button>
  </form>
</div>
```

### RangeSlider

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

#### CSS classes

| Before                                | After                                |
| ------------------------------------- | ------------------------------------ |
| `ais-range-slider`                    | `ais-RangeSlider`                    |
| `ais-range-slider--disabled`          | `ais-RangeSlider--disabled`          |
| `ais-range-slider--handle`            | `ais-RangeSlider-handle`             |
| `ais-range-slider--tooltip`           | `ais-RangeSlider-tooltip`            |
| `ais-range-slider--value`             | `ais-RangeSlider-value`              |
| `ais-range-slider--marker-horizontal` | `ais-RangeSlider-marker--horizontal` |
| `ais-range-slider--marker-large`      | `ais-RangeSlider-marker--large`      |

#### Markup

```html
<div class="ais-RangeSlider">
  <div class="rheostat rheostat-horizontal" style="position: relative;">
    <div class="rheostat-background"></div>
    <div class="rheostat-handle rehostat-handle--lower" aria-valuemax="5000" aria-valuemin="1" aria-valuenow="750" aria-disabled="false" data-handle-key="0" role="slider" tabindex="0" style="left: 15%; position: absolute;">
      <div class="rheostat-tooltip">$750</div>
    </div>
    <div class="rheostat-handle rheostat-handle--upper" aria-valuemax="5000" aria-valuemin="750" aria-valuenow="5000" aria-disabled="false" data-handle-key="1" role="slider" tabindex="0" style="left: 100%; position: absolute;">
      <div class="rheostat-tooltip">$5,000</div>
    </div>
    <div class="rheostat-progress" style="left: 15%; width: 85%;"></div>
    <div class="rheostat-marker rheostat-marker--large" style="left: 0%; position: absolute; margin-left: 0px;">
      <div class="rheostat-value">1</div>
    </div>
    <div class="rheostat-marker" style="left: 2.94118%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 5.88235%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 8.82353%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 11.7647%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 14.7059%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 17.6471%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 20.5882%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 23.5294%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 26.4706%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 29.4118%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 32.3529%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 35.2941%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 38.2353%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 41.1765%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 44.1176%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 47.0588%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker rheostat-marker--large" style="left: 50%; position: absolute; margin-left: 0px;">
      <div class="rheostat-value">2,500</div>
    </div>
    <div class="rheostat-marker" style="left: 52.9412%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 55.8824%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 58.8235%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 61.7647%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 64.7059%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 67.6471%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 70.5882%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 73.5294%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 76.4706%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 79.4118%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 82.3529%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 85.2941%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 88.2353%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 91.1765%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 94.1176%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker" style="left: 97.0588%; position: absolute; margin-left: 0px;"></div>
    <div class="rheostat-marker rheostat-marker--large" style="left: 100%; position: absolute; margin-left: -1px;">
      <div class="rheostat-value">5,000</div>
    </div>
  </div>
</div>
```

### RatingMenu (formerly StarRating)

### Options

| Before          | After             |
| --------------- | ----------------- |
| `attributeName` | `attribute`       |
| `labels.andUp`  | Removed           |

The value for the label `andUp` is now inlined inside `templates.item`.

### CSS classes

| Before                            | After                            |
| --------------------------------- | -------------------------------- |
| `ais-star-rating`                 | `ais-RatingMenu`                 |
| `ais-star-rating--list`           | `ais-RatingMenu-list`            |
| `ais-star-rating--item`           | `ais-RatingMenu-item`            |
| `ais-star-rating--item__active`   | `ais-RatingMenu-item--selected`  |
| `ais-star-rating--item__disabled` | `ais-RatingMenu-item--disabled`  |
| `ais-star-rating--link`           | `ais-RatingMenu-link`            |
| `ais-star-rating--star`           | `ais-RatingMenu-starIcon`        |
|                                   | `ais-RatingMenu-starIcon--full`  |
| `ais-star-rating--star__empty`    | `ais-RatingMenu-starIcon--empty` |
| `ais-star-rating--count`          | `ais-RatingMenu-count`           |

### Markup

```html
<div class="ais-RatingMenu">
  <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
    <symbol id="ais-RatingMenu-starSymbol" viewBox="0 0 24 24"><path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"/></symbol>
    <symbol id="ais-RatingMenu-starEmptySymbol" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></symbol>
  </svg>
  <ul class="ais-RatingMenu-list">
    <li class="ais-RatingMenu-item ais-RatingMenu-item--disabled">
      <div class="ais-RatingMenu-link" aria-label="5 & up" disabled>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <span class="ais-RatingMenu-label" aria-hidden="true">& Up</span>
        <span class="ais-RatingMenu-count">2,300</span>
      </div>
    </li>
    <li class="ais-RatingMenu-item ais-RatingMenu-item--selected">
      <a class="ais-RatingMenu-link" aria-label="4 & up" href="#">
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starEmptySymbol"></use></svg>
        <span class="ais-RatingMenu-label" aria-hidden="true">& Up</span>
        <span class="ais-RatingMenu-count">2,300</span>
      </a>
    </li>
    <li class="ais-RatingMenu-item">
      <a class="ais-RatingMenu-link" aria-label="3 & up" href="#">
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starEmptySymbol"></use></svg>
        <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starEmptySymbol"></use></svg>
        <span class="ais-RatingMenu-label" aria-hidden="true">& Up</span>
        <span class="ais-RatingMenu-count">1,750</span>
      </a>
    </li>
  </ul>
</div>
```

### RefinementList

#### Options

| Before                                     | After                           |
| ------------------------------------------ | ------------------------------- |
| `attributeName`                            | `attribute`                     |
| `searchForFacetValues`                     | `searchable`                    |
| `searchForFacetValues.placeholder`         | `searchablePlaceholder`         |
| `searchForFacetValues.isAlwaysActive`      | `searchableIsAlwaysActive`      |
| `searchForFacetValues.escapeFacetValues`   | `searchableEscapeFacetValues`   |
| `searchForFacetValues.templates.noResults` | `templates.searchableNoResults` |
| `showMore.templates.active`                | `templates.showMoreText`      |
| `showMore.templates.inactive`              | `templates.showMoreText`    |

- `searchablePlaceholder` defaults to `"Search..."`
- `searchableEscapeFacetValues` defaults to `true`
- `searchableIsAlwaysActive` defaults to `true`
- `showMore` is now a boolean option (`searchForFacetValues.templates` and `showMore.templates` are now in `templates`)
- An object containing `isShowingMore` is passed to `showMoreText` template to toggle between the two states:

```
{
  showMoreText: `
    {{#isShowingMore}}
      Show less
    {{/isShowingMore}}
    {{^isShowingMore}}
      Show more
    {{/isShowingMore}}
  `
}
```

#### CSS classes

| Before                              | After                                   |
| ----------------------------------- | --------------------------------------- |
| `ais-refinement-list`               | `ais-RefinementList`                    |
|                                     | `ais-RefinementList--noRefinement`      |
|                                     | `ais-RefinementList-noResults`          |
| `ais-refinement-list--header`       |                                         |
| `ais-refinement-list--body`         |                                         |
| `ais-refinement-list--footer`       |                                         |
| `ais-refinement-list--list`         | `ais-RefinementList-list`               |
| `ais-refinement-list--item`         | `ais-RefinementList-item`               |
| `ais-refinement-list--item__active` | `ais-RefinementList-item--selected`     |
| `ais-refinement-list--label`        | `ais-RefinementList-label`              |
| `ais-refinement-list--checkbox`     | `ais-RefinementList-checkbox`           |
|                                     | `ais-RefinementList-labelText`          |
| `ais-refinement-list--count`        | `ais-RefinementList-count`              |
|                                     | `ais-RefinementList-showMore`           |
|                                     | `ais-RefinementList-showMore--disabled` |

#### Markup

##### Default

```html
<div class="ais-RefinementList">
  <div class="ais-RefinementList-searchBox">
    <!-- SearchBox widget here -->
  </div>
  <ul class="ais-RefinementList-list">
    <li class="ais-RefinementList-item ais-RefinementList-item--selected">
      <label class="ais-RefinementList-label">
        <input class="ais-RefinementList-checkbox" type="checkbox" value="Insignia™" checked="" />
        <span class="ais-RefinementList-labelText">Insignia™</span>
        <span class="ais-RefinementList-count">746</span>
      </label>
    </li>
    <li class="ais-RefinementList-item">
      <label class="ais-RefinementList-label">
        <input class="ais-RefinementList-checkbox" type="checkbox" value="Samsung">
        <span class="ais-RefinementList-labelText">Samsung</span>
        <span class="ais-RefinementList-count">633</span>
      </label>
    </li>
  </ul>
  <button class="ais-RefinementList-showMore">Show more</button>
</div>
```

##### Show more disabled

```html
<div class="ais-RefinementList">
  <div class="ais-RefinementList-searchBox">
    <!-- SearchBox widget here -->
  </div>
  <ul class="ais-RefinementList-list">
    <li class="ais-RefinementList-item ais-RefinementList-item--selected">
      <label class="ais-RefinementList-label">
        <input class="ais-RefinementList-checkbox" type="checkbox" value="Insignia™" checked="" />
        <span class="ais-RefinementList-labelText">Insignia™</span>
        <span class="ais-RefinementList-count">746</span>
      </label>
    </li>
    <li class="ais-RefinementList-item">
      <label class="ais-RefinementList-label">
        <input class="ais-RefinementList-checkbox" type="checkbox" value="Samsung">
        <span class="ais-RefinementList-labelText">Samsung</span>
        <span class="ais-RefinementList-count">633</span>
      </label>
    </li>
  </ul>
  <button class="ais-RefinementList-showMore ais-RefinementList-showMore--disabled" disabled>Show more</button>
</div>
```

##### With search and no results

```html
<div class="ais-RefinementList">
  <div class="ais-RefinementList-searchBox">
    <div class="ais-SearchBox">
      <form class="ais-SearchBox-form" novalidate>
        <input class="ais-SearchBox-input" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Search for products" spellcheck="false" maxlength="512" type="search" value="" />
        <button class="ais-SearchBox-submit" type="submit" title="Submit the search query.">
          <svg class="ais-SearchBox-submitIcon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 40 40">
            <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
          </svg>
        </button>
        <button class="ais-SearchBox-reset" type="reset" title="Clear the search query." hidden>
          <svg class="ais-SearchBox-resetIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="10" height="10">
            <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
          </svg>
        </button>
        <span class="ais-SearchBox-loadingIndicator" hidden>
          <svg width="16" height="16" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444" class="ais-SearchBox-loadingIcon">
            <g fill="none" fillRule="evenodd">
              <g transform="translate(1 1)" strokeWidth="2">
                <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
                <path d="M36 18c0-9.94-8.06-18-18-18">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 18 18"
                    to="360 18 18"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            </g>
          </svg>
        </span>
      </form>
    </div>
  </div>
  <div class="ais-RefinementList-noResults">No results.</div>
</div>
```

### SearchBox

#### Options

| Before                      | After                                    |
| --------------------------- | ---------------------------------------- |
| `poweredBy`                 | use the `poweredBy` widget               |
| `wrapInput`                 | use the `connectSearchBox` connector     |
| `searchOnEnterKeyPressOnly` | `searchAsYouType` (default: `true`)      |
| `reset`                     | `showReset`                              |
| `magnifier`                 | `showSubmit`                             |
| `loadingIndicator`          | `showLoadingIndicator` (default: `true`) |

With the drop of `wrapInput`, we decided not to accept `input`s as containers anymore. If you want complete control over the rendering, you should use the `connectSearchBox` connector.

The search box does not support `powered-by`. If you're using a community plan, you need to use the `poweredBy` widget to display the Algolia logo.

Configuration options for `reset`, `submit` and `loadingIndicator` have been moved to `templates` and `cssClasses`. For example, in the case of `reset`:

- `reset.template` => `templates.reset`
- `reset.cssClasses.root` => `cssClasses.reset`

Finally, `autofocus` is now set to `false` by default and does not support the `"auto"` value anymore.

#### CSS classes

| Before                                      | After                            |
| ------------------------------------------- | -------------------------------- |
| `ais-search-box`                            | `ais-SearchBox`                  |
|                                             | `ais-SearchBox-form`             |
| `ais-search-box--input`                     | `ais-SearchBox-input`            |
| `ais-search-box--magnifier-wrapper`         |                                  |
| `ais-search-box--magnifier`                 | `ais-SearchBox-submit`           |
|                                             | `ais-SearchBox-submitIcon`       |
| `ais-search-box--reset-wrapper`             |                                  |
| `ais-search-box--reset`                     | `ais-SearchBox-reset`            |
|                                             | `ais-SearchBox-resetIcon`        |
| `ais-search-box--loading-indicator-wrapper` |                                  |
| `ais-search-box--loading-indicator`         | `ais-SearchBox-loadingIndicator` |
|                                             | `ais-SearchBox-loadingIcon`      |

#### Markup

```html
<div class="ais-SearchBox">
  <form class="ais-SearchBox-form" novalidate>
    <input class="ais-SearchBox-input" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Search for products" spellcheck="false" maxlength="512" type="search" value="" />
    <button class="ais-SearchBox-submit" type="submit" title="Submit the search query.">
      <svg class="ais-SearchBox-submitIcon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 40 40">
        <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
      </svg>
    </button>
    <button class="ais-SearchBox-reset" type="reset" title="Clear the search query." hidden>
      <svg class="ais-SearchBox-resetIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="10" height="10">
        <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
      </svg>
    </button>
    <span class="ais-SearchBox-loadingIndicator" hidden>
      <svg width="16" height="16" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444" class="ais-SearchBox-loadingIcon">
        <g fill="none" fillRule="evenodd">
          <g transform="translate(1 1)" strokeWidth="2">
            <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
            <path d="M36 18c0-9.94-8.06-18-18-18">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>
      </svg>
    </span>
  </form>
<div>
```

### SortBy

#### Options

| Before    | After   |
| --------- | ------- |
| `indices` | `items` |

- A `sortBy` item value is now `value` instead of `name`:

```javascript
const sortByItem = {
  value: string,
  label: string,
};
```

#### CSS classes

| Before                 | After               |
| ---------------------- | ------------------- |
|                        | `ais-SortBy`        |
| `ais-sort-by-selector` | `ais-SortBy-select` |
| `ais-sort-by--item`    | `ais-SortBy-option` |

#### Markup

```html
<div class="ais-SortBy">
 <select class="ais-SortBy-select">
   <option class="ais-SortBy-option" value="Most relevant">Most relevant</option>
   <option class="ais-SortBy-option" value="Lowest price">Lowest price</option>
 </select>
</div>
```

### Stats

#### CSS classes

| Before            | After            |
| ----------------- | ---------------- |
| `ais-stats`       | `ais-Stats`      |
| `ais-stats--body` |                  |
| `ais-stats--time` |                  |
|                   | `ais-Stats-text` |

#### Markup

```html
<div class="ais-Stats">
  <span class="ais-Stats-text">20,337 results found in 1ms.</span>
</div>
```

### ToggleRefinement (formerly Toggle)

#### Options

| Before              | After                 |
| ------------------- | --------------------- |
| `attributeName`     | `attribute`           |
| `collapsible`       |                       |
| `autoHideContainer` |                       |
| `label`             | `templates.labelText` |
| `templates.item`    |                       |
| `values.on`         | `on`                  |
| `values.off`        | `off`                 |

`collapsible` and `autoHideContainer` options have been removed. These options are now implemented as part of the Panel widget wrapper.

The `label` options has been moved into the `templates.labelText` template to make it consistent with the templates parameters of other widgets and we removed the `item` template. We are now providing the data that were provided to `templates.item` to `templates.labelText`. If your index attribute is called `free_shipping`, the default template will display "free_shipping". To rename it, change `templates.labelText` to "Free shipping".

#### CSS classes

| Before                 | After                            |
| ---------------------- | -------------------------------- |
| `ais-toggle`           | `ais-ToggleRefinement`           |
| `ais-toggle--list`     |                                  |
| `ais-toggle--item`     |                                  |
|                        | `ais-ToggleRefinement-label`     |
| `ais-toggle--checkbox` | `ais-ToggleRefinement-checkbox`  |
| `ais-toggle--label`    | `ais-ToggleRefinement-labelText` |

#### Markup

```html
<div class="ais-ToggleRefinement">
  <label class="ais-ToggleRefinement-label">
    <input class="ais-ToggleRefinement-checkbox" type="checkbox" value="Free Shipping" />
    <span class="ais-ToggleRefinement-labelText">Free Shipping</span>
  </label>
</div>
```

## Connectors

### connectBreadcrumb

- The BreadcrumbItem `name` property is renamed to `label`.

### connectGeoSearch

#### Options

| Before                    | After                                                  |
| ------------------------- | ------------------------------------------------------ |
| `paddingBoundingBox`      | Removed                                                |
| `enableGeolocationWithIP` | Removed - use the Configure widget instead (see below) |
| `position`                | Removed - use the Configure widget instead (see below) |
| `radius`                  | Removed - use the Configure widget instead (see below) |
| `precision`               | Removed - use the Configure widget instead (see below) |

- `paddingBoundingBox` was in conflict with the `routing` option - so we removed it to support URLSync for the GeoSearch widget.

#### `enableGeolocationWithIP`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  enableGeolocationWithIP: true,
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundLatLngViaIP: true,
});

customGeoSearch();
```

#### `position`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  position: { lat: 40.71, lng: -74.01 },
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundLatLng: '40.71, -74.01',
});

customGeoSearch();
```

#### `radius`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  radius: 1000,
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundRadius: 1000,
});

customGeoSearch();
```

#### `precision`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  precision: 1000,
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundPrecision: 1000,
});

customGeoSearch();
```

### connectRange

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

### connectRangeSlider

Connector removed (use `connectRange` instead).

### connectClearRefinements (formerly connectClearAll)

#### Options

| Before              | After                |
| ------------------- | -------------------- |
| `excludeAttributes` | `excludedAttributes` |

### connectNumericMenu (formerly connectNumericRefinementList)

#### Options

| Before    | After   |
| --------- | ------- |
| `options` | `items` |

### connectRefinementList

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

- `escapeFacetValues` defaults to `true`
