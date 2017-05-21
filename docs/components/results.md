Vue InstantSearch Results
---

A component to format and render the search results.

## Usage

Basic usage:

```html
<ais-results>
  <template scope="{ result }">
    <h2>
      <a :href="result.url">
        {{ result.title }}
      </a>
    </h2>
    <p>{{ result.description }}</p>
  </template>
</ais-results>
```

## Props

| Name           | Type    | Default | Description                                                                    |
|:---------------|:--------|:--------|:-------------------------------------------------------------------------------|
| stack          | Boolean | `false` | If true, will append results of next page to current results when page changes |
| resultsPerPage | Number  | ``      | The number of results to display                                               |


## Slots

| Name    | Props  | Default                                                                                         | Description     |
|:--------|:-------|:------------------------------------------------------------------------------------------------|:----------------|
| default | result | Displays the objectID                                                                           | First page text |
| header  |        | Allows to add content at the top of the component which will be hidden when the component is    |                 |
| footer  |        | Allows to add content at the bottom of the component which will be hidden when the component is |                 |

## CSS Classes

| ClassName   | Description     |
|:------------|:----------------|
| ais-results | Container class |
