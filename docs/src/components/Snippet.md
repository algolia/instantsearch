---
title: Snippet
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 10
editable: true
githubSource: docs/src/components/Snippet.md
---

Display snippeted attributes of your search results.

This component leverages the [snippeting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-attributes-to-snippet-how-does-it-work/#faq-section) and is designed to work with `escapeHTML` set to true in the surrounding `<ais-hits>`.


## Usage

**Basic usage:**

```html
<ais-snippet :hit="hit" attribute="description"></ais-snippet>
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
<ais-snippet :hit="hit" attribute="meta.title"></ais-snippet>
```

Note that you also need to set up the correct attributes to snippet, you can do this runtime as well: 

```html
<ais-configure
  :attributesToSnippet="['name', 'description']"
  snippetEllipsisText="[…]"
>
</ais-configure>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
hit | Object |  | A single Algolia result as it is returned by the API. | yes
attribute | String |  | The attribute name to be snippeted. | yes
highlightedTagName | String |  | The tag name to use on the highlighted items. | no
classNames | Object | | Override class names | no

## CSS Classes

Class name | Description
---|---
`ais-Snippet` | Container class
`ais-Snippet-highlighted` | parts of the string matching the query
