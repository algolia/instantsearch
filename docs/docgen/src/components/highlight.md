---
title: Highlight
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 100
editable: true
githubSource: docs/docgen/src/components/highlight.md
---
Safely displays highlighted attributes of your search results.

This component leverages the [highlighting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-the-highlighting/#faq-section)
but adds some sugar on top of it to prevent XSS attacks.

This component will override the following settings of your index at query time:
- highlightPreTag
- highlightPostTag

You will then be able to choose your custom highlighting tag on a per component basis.

## Usage

Basic usage:

```html
<ais-highlight :result="result" attribute-name="description"></ais-highlight>
```

Changing the highlighting tag:

 ```html
<ais-highlight :result="result" attribute-name="description" tag-name="em"></ais-highlight>
 ```

**Note that the tag name has to be passed without carets.**

Disable html escaping (**not recommended**):

```html
<ais-highlight :result="result" attribute-name="description" :escape-html="false"></ais-highlight>
```

## Props

| Name           | Required | Type    | Default  | Description                                           |
|:---------------|:---------|:--------|:---------|:------------------------------------------------------|
| result         | true     | Object  |          | A single Algolia result as it is returned by the API. |
| attribute-name | true     | String  |          | The attribute name to be highlighted.                 |
| tag-name       | false    | String  | `'mark'` | The tag name used for highlighting.                   |
| escape-html    | false    | Boolean | `true`   | Whether to escape the HTML or not.                    |

## CSS Classes

| ClassName     | Description     |
|:--------------|:----------------|
| ais-highlight | Container class |
