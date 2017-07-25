---
title: Searchbox
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 3
editable: true
githubSource: docs/docgen/src/components/search-box.md
---

A search input with a clear and submit button.

## Usage

Basic usage:

```html
<ais-search-box placeholder="Find products..."></ais-search-box>
```

With autofocus:

```html
<ais-search-box :autofocus="true"></ais-search-box>
```

## Props

| Name         | Type    | Default    | Description                                              |
|:-------------|:--------|:-----------|:---------------------------------------------------------|
| placeholder  | String  | `''`       | The input placeholder                                    |
| submit-title | String  | `'search'` | The submit button text                                   |
| clear-title  | String  | `'clear'`  | The clear button text                                    |
| autofocus    | Boolean | `false`    | Wether to automatically focus on the input when rendered |

## Slots

| Name    | Props | Default                                                | Description     |
|:--------|:------|:-------------------------------------------------------|:----------------|
| default |       | Contains the search input, the clear and submit button | First page text |

## CSS Classes

| ClassName              | Description       |
|:-----------------------|:------------------|
| ais-search-box         | Container class   |
| ais-search-box__submit | The submit button |
