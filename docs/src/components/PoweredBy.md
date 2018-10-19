---
title: Powered By
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 12
editable: true
githubSource: docs/src/components/PoweredBy.md
---

A component that helps you quickly add the "powered by Algolia" mention that is required if you have a free plan.

<a class="btn btn-static-theme" href="stories/?selectedKind=PoweredBy">🕹 try out live</a>

## Usage

Basic usage:

```html
<ais-powered-by></ais-powered-by>
```

Dark background:

```html
<ais-powered-by theme="dark"></ais-powered-by>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
theme | `"light" | "dark"` | `"light"` | Use a version of the logo legible on light or dark backgrounds | no
class-names | Object | | Override class names | no

## Slots

This component provides no slots


## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`.ais-PoweredBy` | the root div of the widget
`.ais-PoweredBy--light` | the root div of the widget with light background theme
`.ais-PoweredBy--dark` | the root div of the widget with dark background theme
`.ais-PoweredBy-link` | the link
`.ais-PoweredBy-logo` | the actual illustration
