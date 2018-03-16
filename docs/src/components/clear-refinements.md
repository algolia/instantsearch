---
title: Clear
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 8
editable: true
githubSource: docs/src/components/clear.md
---

A button that clears the `query`, the `active refinements`, or both when pressed.

<a class="btn btn-static-theme" href="stories/?selectedKind=Clear">🕹 try out live</a>

## Usage

Basic usage:

```html
<ais-clear></ais-clear>
```

Overriding the default button text:

```html
<ais-clear>
	<template>
		Clear search query
	</template>
</ais-clear>
```

Only clear the search query:

```html
<ais-clear :clears-facets="false"></ais-clear>
```

Only clear the facet refinements:

```html
<ais-clear :clears-query="false"></ais-clear>
```

## Props

| Name          | Type    | Default | Description                                                                       |
|:--------------|:--------|:--------|:----------------------------------------------------------------------------------|
| clears-query  | boolean | `true`  | If `true`, when the button is clicked, the `query` will be emptied.               |
| clears-facets | boolean | `true`  | If `true`, when the button is clicked, all the facet refinements will be removed. |

## Slots

| Name    | Props | Default                                       | Description                                 |
|:--------|:------|:----------------------------------------------|:--------------------------------------------|
| default | query | `<span class="ais-clear__label">Clear</span>` | The text displayed inside the clear button. |

## CSS Classes

| ClassName          | Description       |
|:-------------------|:------------------|
| `ais-clear`        | Button class      |
| `ais-clear__label` | Button text class |
