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

## Slots

| Name    | Props | Default                                              | Description                                 |
|---------|-------|------------------------------------------------------|---------------------------------------------|
| default | query | `<span class="alg-clear-search__label">Clear</span>` | The text displayed inside the clear button. |

## CSS Classes

| ClassName               | Description       |
|-------------------------|-------------------|
| alg-clear-search        | Button class      |
| alg-clear-search__label | Button text class |
