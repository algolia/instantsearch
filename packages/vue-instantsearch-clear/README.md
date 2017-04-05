Vue InstantSearch Clear
---

A button that allows the user to clear the `query`, the `facet refinements`, or both.

## Usage

Basic usage:

```html
<ais-clear></ais-clear>
```

Overriding the default content:

```html
<ais-clear>
	<template>
		Clear search query
	</template>
</ais-clear>
```

Only clear the search query:

```html
<ais-clear:clearFacets="false"></ais-clear>
```

Only clear the facet refinements:

```html
<ais-clear:clearQuery="false"></ais-clear>
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
