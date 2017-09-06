---
title: Highlight
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 9
editable: true
githubSource: docs/src/components/highlight.md
---
Safely displays highlighted attributes of your search results.

This component leverages the [highlighting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-the-highlighting/#faq-section)
but adds some sugar on top of it to prevent XSS attacks.

## Usage

**Basic usage:**

```html
<ais-highlight :result="result" attribute-name="description"></ais-highlight>
```

**Access a nested property:**

Given an record like:

```json
{
    "objectID": 1,
    "meta": {
        "title": "my title"
    }
}
```

You can access the highlighted version by specifying the path by separating levels with dots:

```html
<ais-highlight :result="result" attribute-name="meta.title"></ais-highlight>
```

**Advanced use cases:**

For more complex data structures, it will be necessary to leverage the [_highlightResult](https://www.algolia.com/doc/guides/searching/highlighting-snippeting/#response-information) object directly. For example, consider the case of an array of keywords:

```html
<ais-results>
  <template scope="{ result }">
    <p v-for="keyword in result._highlightResult.keywords" v-html="keyword.value"></p>
  </template>
</ais-results>
```

## Props

| Name           | Required | Type   | Default | Description                                             |
|:---------------|:---------|:-------|:--------|:--------------------------------------------------------|
| result         | true     | Object |         | A single Algolia result as it is returned by the API.   |
| attribute-name | true     | String |         | The attribute name to be highlighted.                 | |

## CSS Classes

| ClassName       | Description     |
|:----------------|:----------------|
| `ais-highlight` | Container class |
