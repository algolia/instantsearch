Vue InstantSearch Clear
---

A button that clears the `query`, the `active refinements`, or both when pressed.

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
<ais-clear :clearsFacets="false"></ais-clear>
```

Only clear the facet refinements:

```html
<ais-clear :clearsQuery="false"></ais-clear>
```

## Props

| Name         | Type    | Default | Description                                                                       |
|:-------------|:--------|:--------|:----------------------------------------------------------------------------------|
| clearsQuery  | boolean | `true`  | If `true`, when the button is clicked, the `query` will be emptied.               |
| clearsFacets | boolean | `true`  | If `true`, when the button is clicked, all the facet refinements will be removed. |

## Slots

| Name    | Props | Default                                       | Description                                 |
|:--------|:------|:----------------------------------------------|:--------------------------------------------|
| default | query | `<span class="ais-clear__label">Clear</span>` | The text displayed inside the clear button. |

## CSS Classes

| ClassName        | Description       |
|:-----------------|:------------------|
| ais-clear        | Button class      |
| ais-clear__label | Button text class |
