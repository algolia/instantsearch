Vue Algolia Empty Results
---

A convenience component that will only be showed when no results are to be yielded.

## Usage

Basic usage:

```html
<empty-results></empty-results>
```

Overriding the default content:

 ```html
<empty-results>
	<template scope="props">
		No products matcher <i>{{ props.query }}</i>.
	</template>
</empty-results>
 ```

## Slots

| Name    | Props | Default                                                                                     | Description                                              |
|---------|-------|---------------------------------------------------------------------------------------------|----------------------------------------------------------|
| default | query | `No results matched your query <strong class="alg-empty-results__query">{{query}}</strong>` | The content to be displayed when no results are yielded. |

## CSS Classes

| ClassName                       | Description        |
|---------------------------------|--------------------|
| alg-empty-search-results        | Container class.   |
| alg-empty-search-results__query | The current query. |
