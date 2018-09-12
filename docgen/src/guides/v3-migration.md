This document helps you migrate from InstantSearch 2 to InstantSearch 3.

InstantSearch 3 introduces some breaking changes in the widget's naming, options and markup.

## Widgets

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
