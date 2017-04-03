Vue Algolia No Results
---

A convenience component that will only be showed when no results are to be yielded.

## Usage

Basic usage:

```html
<no-results></no-results>
```

Overriding the default content:

 ```html
<no-results>
	<template scope="props">
		No products found for <i>{{ props.query }}</i>.
	</template>
</no-results>
 ```

## Slots

| Name    | Props | Default                                                                                  | Description                                              |
|---------|-------|------------------------------------------------------------------------------------------|----------------------------------------------------------|
| default | query | `No results matched your query <strong class="ais-no-results__query">{{query}}</strong>` | The content to be displayed when no results are yielded. |

## CSS Classes

| ClassName             | Description       |
|-----------------------|-------------------|
| ais-no-results        | Container class   |
| ais-no-results__query | The current query |
