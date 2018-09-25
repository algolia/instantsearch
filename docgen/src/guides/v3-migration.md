This document helps you migrate from InstantSearch 2 to InstantSearch 3.

InstantSearch 3 introduces some breaking changes in the widget's naming, options and markup.

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

### Hits

#### Options

| Before          | After           |
| --------------- | --------------- |
| `escapeHits`    | `escapeHTML`    |
| `showMoreLabel` | `loadMoreLabel` |

* `escapeHTML` becomes `true` by default.
* `allItems` template has been removed in favor of `connectHits`

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

### clearRefinements -- previously clearAll

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

### SearchBox

#### Options

| Before                      | After                                    |
| --------------------------- | ---------------------------------------- |
| `poweredBy`                 | use the dedicated widget                 |
| `wrapInput`                 | Use the connectSearchBox instead         |
| `searchOnEnterKeyPressOnly` | `searchAsYouType` (default: `true`)      |
| `reset`                     | `showReset`                              |
| `magnifier`                 | `showSubmit`                             |
| `loadingIndicator`          | `showLoadingIndicator` (default: `true`) |

With the drop of wrapInput, we decided not to accept `INPUT` as a container anymore. If you
want complete control over the rendering, you should use the `connectSearchBox`.

The search box does not support powered-by. If you're using a community plan, you should now
use the powered-by widget to display the Algolia logo.

Configuration options for `reset`, `submit` and `loadingIndicator` have been dispatched to
`templates` and `cssClasses`. For example, in the case of `reset`:

* `reset.template` => `templates.reset`
* `reset.cssClasses.root` => `cssClasses.reset`

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

### Pagination

### Options

| Before          | After                  |
| --------------- | ---------------------- |
| `maxPages`      | `totalPages`           |
| `showFirstLast` | `showFirst` `showLast` |
|                 | `showNext`             |
|                 | `showPrevious`         |

### CSS classes

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

### Markup

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

## Connectors

### connectRange

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

### connectClearRefinements -- previously connectClearAll

#### Options

| Before              | After                |
| ------------------- | -------------------- |
| `excludeAttributes` | `excludedAttributes` |
