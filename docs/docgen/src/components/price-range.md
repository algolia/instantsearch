---
title: Price range
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 13
editable: true
githubSource: docs/docgen/src/components/price-range.md
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
| from-placeholder   | false    | string | `'min'`  | The input placeholder for the minimum value to return results for.    |
| to-placeholder     | false    | string | `'max'`  | The input placeholder for the maximum value to return results for.    |
| attribute-name     | true     | string |          | The attribute to filter on.                                           |
| currency           | false    | string | `'$'`    | The currency.                                                         |
| currency-placement | false    | string | `'left'` | Whether to display the currency 'left' or 'right' side of the inputs. |

## Slots

| Name    | Props | Default | Description                                                                                      |
|:--------|:------|:--------|:-------------------------------------------------------------------------------------------------|
| header  |       |         | Allows to add content at the top of the component which will be hidden when the component is.    |
| footer  |       |         | Allows to add content at the bottom of the component which will be hidden when the component is. |
| default |       | `'to '` | Text displayed between the 'min' and 'max' inputs.                                               |

## CSS Classes

| ClassName                        | Description                                      |
|:---------------------------------|:-------------------------------------------------|
| ais-price-range                  | Container class.                                 |
| ais-price-range__currency        | Wraps the currency symbol.                       |
| ais-price-range__currency--left  | When the currency is displayed before the input. |
| ais-price-range__currency--right | When the currency is displayed after the input.  |
| ais-price-range__input           | Min and max input element's class.               |
| ais-price-range__input--from     | Min input element's class.                       |
| ais-price-range__input--to       | Max input element's class.                       |
