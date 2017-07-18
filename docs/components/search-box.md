Vue InstantSearch Search Box
---

A search input with a clear and submit button.

## Usage

Basic usage:

```html
<ais-search-box placeholder="Find products..."></ais-search-box>
```

## Props

| Name         | Type   | Default    | Description            |
|:-------------|:-------|:-----------|:-----------------------|
| placeholder  | String | `''`       | The input placeholder  |
| submit-title | String | `'search'` | The submit button text |
| clear-title  | String | `'clear'`  | The clear button text  |

## Slots

| Name    | Props | Default                                                | Description     |
|:--------|:------|:-------------------------------------------------------|:----------------|
| default |       | Contains the search input, the clear and submit button | First page text |

## CSS Classes

| ClassName              | Description       |
|:-----------------------|:------------------|
| ais-search-box         | Container class   |
| ais-search-box__submit | The submit button |
