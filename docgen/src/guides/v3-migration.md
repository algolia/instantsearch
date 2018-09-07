This document helps you migrate from InstantSearch 2 to InstantSearch 3.

InstantSearch 3 introduces some breaking changes in the widget's naming, options and markup.

## Widgets

### Hits

#### Options

| Before       | After        |
| ------------ | ------------ |
| `escapeHits` | `escapeHTML` |

`escapeHTML` becomes `true` by default.

#### CSS classes

| Before            | After            |
| ----------------- | ---------------- |
| `ais-hits`        | `ais-Hits`       |
|                   | `ais-Hits--list` |
| `ais-hits--item`  | `ais-Hits--item` |
| `ais-hits--empty` |                  |

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
|                                     | `ais-InfiniteHits--list`              |
| `ais-infinite-hits--item`           | `ais-InfiniteHits--item`              |
| `ais-infinite-hits--empty`          |                                       |
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
</div>
```

## Connectors
