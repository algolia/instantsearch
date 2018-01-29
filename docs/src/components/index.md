---
title: Index
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 1
editable: true
githubSource: docs/src/components/index.md
---

A wrapper component that allows you to configure the credentials and query parameters for the search.

This component automatically provides the search state to all its children.

## Usage

Basic usage:

```html
<ais-index index-name="your_indexName"
           app-id="YourAppID"
           api-key="YourSearchAPIKey"
>
  <!-- Add your InstantSearch components here. -->
</ais-index>
```

Provide search query parameters:

```html
<ais-index index-name="your_indexName"
           app-id="YourAppID"
           api-key="YourSearchAPIKey"
           :query-parameters="{
             distinct: true,
             attributeForDistinct: 'product_id'
           }"
>
  <!-- Add your InstantSearch components here. -->
</ais-index>
```


## Props

| Name             | Type    | Default | Description                                                                                                                                        |
|------------------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| api-key          | String  | ``      | The API key                                                                                                                                        |
| app-id           | String  | ``      | The application ID                                                                                                                                 |
| index-name       | String  | ``      | The index name                                                                                                                                     |
| query            | String  | ``      | The search query                                                                                                                                   |
| query-parameters | Object  | ``      | The search query parameters. Available options are [documented here](https://www.algolia.com/doc/api-reference/search-api-parameters/). |
| cache            | Boolean | `true`  | Whether to cache results or not. See [the documentation](https://www.algolia.com/doc/tutorials/getting-started/quick-start-with-the-api-client/javascript/#cache)       |
| auto-search      | Boolean | `true`  | Whether to initiate a query to Algolia when this component is mounted                                                                               |
| stalledSearchDelay | number | `200`  | Time before the search is considered unresponsive. Used to display a loading indicator. |

## Slots

| Name    | Description                                                                      |
|---------|----------------------------------------------------------------------------------|
| default | Can contain anything. All InstantSearch components will have the index injected. |

## CSS Classes

| ClassName   | Description     |
|-------------|-----------------|
| `ais-index` | Container class |
