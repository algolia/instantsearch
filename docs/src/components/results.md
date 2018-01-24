---
title: Results
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 4
editable: true
githubSource: docs/src/components/results.md
---

A component to format and render the search results.

## Usage

Basic usage:

```html
<ais-results>
  <template slot-scope="{ result }">
    <h2>
      <a :href="result.url">
        {{ result.title }}
      </a>
    </h2>
    <p>{{ result.description }}</p>
  </template>
</ais-results>
```

Render results in a table:

```html
<ais-results inline-template>
  <table>
    <tbody>
      <tr v-for="result in results" :key="result.objectID">
        <td>{{ result.name }}</td>
        <td>{{ result.description }}</td>
      </tr>
    </tbody>
  </table>
</ais-results>
```

**Hint:** In this case, you actually need to use a [special Vue `inline-template` attribute](https://vuejs.org/v2/guide/components.html#Inline-Templates).
This will totally replace the existing default template and give you access to the `Results` component instance.

## Props

| Name             | Type    | Default                               | Description                                                                    |
| ---------------- | ------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| stack            | Boolean | `false`                               | If true, will append results of next page to current results when page changes |
| results-per-page | Number  | `` | The number of results to display |

## Slots

| Name    | Props         | Default                                                                                       | Description     |
| ------- | ------------- | --------------------------------------------------------------------------------------------- | --------------- |
| default | result, index | Displays the objectID                                                                         | First page text |
| header  |               | Add content to the top of the component, which will be hidden when the component is hidden    |                 |
| footer  |               | Add content to the bottom of the component, which will be hidden when the component is hidden |                 |

## CSS Classes

| ClassName     | Description     |
| ------------- | --------------- |
| `ais-results` | Container class |
