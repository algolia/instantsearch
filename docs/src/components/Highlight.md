---
title: Highlight
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 9
editable: true
githubSource: docs/src/components/Highlight.md
---

Displays highlighted attributes of your search results.

This component leverages the [highlighting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-the-highlighting/#faq-section) and is designed to work with `escapeHTML` set to true in the surrounding `<ais-hits>`.

## Usage

**Basic usage:**

```html
<ais-highlight :hit="hit" attribute="description"></ais-highlight>
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
<ais-highlight :hit="hit" attribute="meta.title"></ais-highlight>
```

**Advanced use cases:**

For more complex data structures, it will be necessary to leverage the [_highlightResult](https://www.algolia.com/doc/guides/searching/highlighting-snippeting/#response-information) object directly. For example, consider the case of an array of keywords:

```html
<ais-hits :escape-HTML="true">
  <template name="item" slot-scope="{ item }">
    <p v-for="keyword in item._highlightResult.keywords" v-html="keyword.value"></p>
  </template>
</ais-hits>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
hit | Object |  | A single Algolia result as it is returned by the API. | yes
attribute | String |  | The attribute name to be highlighted. | yes
highlightedTagName | String |  | The tag name to use on the highlighted items. | no
classNames | Object | | Override class names | no

## CSS Classes

Class name | Description
---|---
`ais-Highlight` | Container class
`ais-Highlight-highlighted` | parts of the string matching the query
