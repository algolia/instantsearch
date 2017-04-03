Vue Algolia Clear Search
---

A button that allows the user to clear the `query`, the `facet refinements`, or both.

## Usage

Basic usage:

```html
<clear-search></clear-search>
```

Overriding the default content:

```html
<clear-search>
	<template>
		Clear search query
	</template>
</clear-search>
```

Only clear the search query:

```html
<clear-search :clearFacets="false"></clear-search>
```

Only clear the facet refinements:

```html
<clear-search :clearQuery="false"></clear-search>
```

## Props

| Name        | Type    | Default | Description                                                                     |
|-------------|---------|---------|---------------------------------------------------------------------------------|
| clearQuery  | boolean | `true`  | If `true`, when the button is clicked, the `query` will be emptied.               |
| clearFacets | boolean | `true`  | If `true`, when the button is clicked, all the facet refinements will be removed. |

## Slots

| Name    | Props | Default                                              | Description                                 |
|---------|-------|------------------------------------------------------|---------------------------------------------|
| default | query | `<span class="ais-clear__label">Clear</span>` | The text displayed inside the clear button. |

## CSS Classes

| ClassName               | Description       |
|-------------------------|-------------------|
| ais-clear        | Button class      |
| ais-clear__label | Button text class |
