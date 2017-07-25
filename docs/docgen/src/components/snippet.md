---
title: Snippet
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 10
editable: true
githubSource: docs/docgen/src/components/snippet.md
---

Safely display snippeted attributes of your search results.

This component leverages the [snippeting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-attributes-to-snippet-how-does-it-work/#faq-section)
but adds some sugar on top of it to prevent XSS attacks.


## Usage

Basic usage:

```html
<ais-snippet :result="result" attribute-name="description"></ais-snippet>
```

## Props

| Name           | Required | Type   | Default | Description                                             |
|:---------------|:---------|:-------|:--------|:--------------------------------------------------------|
| result         | true     | Object |         | A single Algolia result as it is returned by the API.   |
| attribute-name | true     | String |         | The attribute name to be snippeted.                   | |

## CSS Classes

| ClassName   | Description     |
|:------------|:----------------|
| ais-snippet | Container class |
