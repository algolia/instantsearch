# Contributing

This guide explains how the documentation process works for InstantSearch.js.

## Frontmatter

The frontmatter of your [Markdown](https://en.wikipedia.org/wiki/Markdown) page describes the metadata that will be generated at compile time.

We offer several attributes that allow to customize the rendering of your documentation or guide. You don't need to specify the ones that default to a value ([see example](#example)).

### Attributes

#### `title`

> `string` | no default

The title of your page.

#### `mainTitle`

> `string` | no default

The name of the category of your page.

#### `layout`

> `string` | no default

The layout of your page among [`docgen/layouts/`](docgen/layouts/) (i.e. [`main.pug`](docgen/layouts/main.pug)).

#### `category`

> `string` | no default

The category of your page.

#### `name`

> `string` | no default

The name to use for the file name of the [URL](https://en.wikipedia.org/wiki/URL).

#### `withHeadings`

> `boolean` | defaults to `false`

`true` if the page should contain headings, `false` otherwise.

#### `navWeight`

> `number` | no default

The number that describes the order of the page in the menu.

#### `editable`

> `boolean` | defaults to `false`

`true` if you want to display the "Edit this page" link, `false` otherwise.

#### `githubSource`

> `string` | no default

If the page is `editable`, link to its source on GitHub for the "Edit this page" link.

#### `appId`

> `string` | defaults to `latency`

The Algolia application ID to run the code samples on.

#### `apiKey`

> `string` | defaults to `6be0576ff61c053d5f9a3225e2a90f76`

The API key of the app to run the code samples on.

#### `index`

> `string` | defaults to `instant_search`

The index name of the app to run the code samples on.

### Example

```markdown
---
title: Introduction
mainTitle: Widgets
layout: widget-showcase.pug
category: widgets
withHeadings: true
navWeight: 100
editable: true
githubSource: docgen/src/widgets.md
---

# The start of your page
```
