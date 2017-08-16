---
title: Snippet
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 10
editable: true
githubSource: docs/src/components/snippet.md
---

Safely display snippeted attributes of your search results.

This component leverages the [snippeting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-attributes-to-snippet-how-does-it-work/#faq-section)
but adds some sugar on top of it to prevent XSS attacks.


## Usage

**Basic usage:**

```html
<ais-snippet :result="result" attribute-name="description"></ais-snippet>
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

You can access the snippeted version by specifying the path by separating levels with dots:

```html
<ais-snippet :result="result" attribute-name="meta.title"></ais-snippet>
```

## Props

| Name           | Required | Type   | Default | Description                                             |
|:---------------|:---------|:-------|:--------|:--------------------------------------------------------|
| result         | true     | Object |         | A single Algolia result as it is returned by the API.   |
| attribute-name | true     | String |         | The attribute name to be snippeted.                   | |

## CSS Classes

| ClassName     | Description     |
|:--------------|:----------------|
| `ais-snippet` | Container class |
