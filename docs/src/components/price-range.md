---
title: Price range
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 13
editable: true
githubSource: docs/src/components/price-range.md
---

A component that lets users filter results based on a given minimum and maximum price.

## Usage

Basic usage:

```html
<ais-price-range></ais-price-range>
```

## Props

| Name               | Required | Type   | Default  | Description                                                           |
|:-------------------|:---------|:-------|:---------|:----------------------------------------------------------------------|
| from-placeholder   | false    | string | `'min'`  | The input placeholder for the minimum value.                          |
| to-placeholder     | false    | string | `'max'`  | The input placeholder for the maximum value.                          |
| attribute-name     | true     | string |          | The attribute to filter on.                                           |
| currency           | false    | string | `'$'`    | The currency.                                                         |
| currency-placement | false    | string | `'left'` | Whether to display the currency 'left' or 'right' side of the inputs. |

## Slots

| Name    | Props | Default | Description                                                                                      |
|:--------|:------|:--------|:-------------------------------------------------------------------------------------------------|
| header  |       |         | Add content to the top of the component, which will be hidden when the component is hidden.     |
| footer  |       |         | Add content to the bottom of the component, which will be hidden when the component is hidden.  |
| default |       | `'to '` | Text displayed between the 'min' and 'max' inputs.                                               |

## CSS Classes

| ClassName                          | Description                                      |
|:-----------------------------------|:-------------------------------------------------|
| `ais-price-range`                  | Container class.                                 |
| `ais-price-range__currency`        | Wraps the currency symbol.                       |
| `ais-price-range__currency--left`  | When the currency is displayed before the input. |
| `ais-price-range__currency--right` | When the currency is displayed after the input.  |
| `ais-price-range__input`           | Min and max input element's class.               |
| `ais-price-range__input--from`     | Min input element's class.                       |
| `ais-price-range__input--to`       | Max input element's class.                       |
