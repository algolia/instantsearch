---
title: Range input
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 13
editable: true
githubSource: docs/src/components/range-input.md
---

A component that lets users filter results based on a given minimum and maximum value.

## Usage

Basic usage:

```html
<ais-range-input
  attribute-name="price"
/>
```

## Props

| Name               | Required | Type                           | Default  | Description                                                                                                                  |
|:-------------------|:---------|:-------------------------------|:---------|:-----------------------------------------------------------------------------------------------------------------------------|
| attribute-name     | true     | `string`                       |          | The attribute to filter on.                                                                                                  |
| default-refinement | false    | `{ min: number, max: number }` |          | Default state of the widget containing the start and the end of the range.                                                   |
| min                | false    | `number`                       |          | Minimum value. When this isn’t set, the minimum value will be automatically computed by Algolia using the data in the index. |
| max                | false    | `number`                       |          | Maximum value. When this isn’t set, the maximum value will be automatically computed by Algolia using the data in the index. |
| precision          | false    | `number`                       | `0`      | Number of digits after decimal point to use.                                                                                 |

## Slots

| Name      | Props | Default | Description                                        |
|:----------|:------|:--------|:---------------------------------------------------|
| header    |       |         | Add content to the top of the component.           |
| separator |       | `to`    | Text displayed between the 'min' and 'max' inputs. |
| submit    |       | `ok`    | Text displayed inside the submit button.           |
| footer    |       |         | Add content to the bottom of the component.        |

## CSS Classes

| ClassName                          | Description                                      |
|:-----------------------------------|:-------------------------------------------------|
| `ais-range-input`                  | Container class.                                 |
| `ais-range-input__input`           | Min and max input element's class.               |
| `ais-range-input__input--from`     | Min input element's class.                       |
| `ais-range-input__input--to`       | Max input element's class.                       |
