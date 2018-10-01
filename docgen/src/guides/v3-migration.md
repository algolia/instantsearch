This document helps you migrate from InstantSearch 2 to InstantSearch 3.

InstantSearch 3 introduces some breaking changes in the widget's naming, options and markup.

## InstantSearch

### URLSync is not supported anymore

If you were previously using the `urlSync` option, you should now migrate to the new `routing` feature.

Here are the elements you need to migrate:

- `urlSync: true` becomes `routing: true`
- `threshold` becomes `routing: {router: instantsearch.routers.history({writeDelay: 400})}
- `mapping` and `trackedParameters` are replaced with `stateMapping`. Read [User friendly urls](routing.html#user-friendly-urls) to know how to configure it
- `useHash` is removed but can be achieved using an advanced configuration of the [history router](routing.html#history-router-api)
- `getHistoryState` is removed but can be achieved using an advanced configuration of the [history router](routing.html#history-router-api)

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

### GeoSearch

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

| Before       | After        |
| ------------ | ------------ |
| `escapeHits` | `escapeHTML` |

`escapeHTML` becomes `true` by default.

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

### Pagination

#### Options

| Before          | After                  |
| --------------- | ---------------------- |
| `maxPages`      | `totalPages`           |
| `showFirstLast` | `showFirst` `showLast` |
|                 | `showNext`             |
|                 | `showPrevious`         |

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

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

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
| `ais-range-input--submit`    | `ais-RangeInput-button`        |

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

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

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

#### Options

| Before                 | After        |
| ---------------------- | ------------ |
| `attributeName`        | `attribute`  |
| `searchForFacetValues` | `searchable` |

- `escapeFacetValues` defaults to `true`
- `isAlwaysActive` defaults to `true`

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

### SortBy

#### Options

| Before    | After   |
| --------- | ------- |
| `indices` | `items` |

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

We've moved the `label` into the `templates.labelText` template to make it consistent with the templates parameters of other widgets and we removed the `item` template. We are now providing the data that were provided to `templates.item` to `templates.labelText`.

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

### connectRange

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

### connectClearRefinements (formerly connectClearAll)

#### Options

| Before              | After                |
| ------------------- | -------------------- |
| `excludeAttributes` | `excludedAttributes` |

### connectRefinementList

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

- `escapeFacetValues` defaults to `true`
