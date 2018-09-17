This document helps you migrate from InstantSearch 2 to InstantSearch 3.

InstantSearch 3 introduces some breaking changes in the widget's naming, options and markup.

## Widgets

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
