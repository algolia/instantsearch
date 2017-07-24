---
title: Index
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 100
editable: true
githubSource: docs/docgen/src/components/index.md
---

A wrapper component that allows to configure the credentials and the query parameters for the search.

This component automatically provides the search state to all its children.

## Usage

Basic usage:

```html
<ais-index indexName="your_indexName"
           appId="YourAppID"
           apiKey="YourSearchAPIKey"
>
  <!-- Add your InstantSearch components here. -->
</ais-index>
```

Provide search query parameters:

```html
<ais-index indexName="your_indexName"
           appId="YourAppID"
           apiKey="YourSearchAPIKey"
           :queryParameters="{
             distinct: true,
             attributeForDistinct: 'product_id'
           }"
>
  <!-- Add your InstantSearch components here. -->
</ais-index>
```


## Props

| Name            | Type   | Default | Description                                                                                                                                        |
|:----------------|:-------|:--------|:---------------------------------------------------------------------------------------------------------------------------------------------------|
| apiKey          | String | ``      | The API key                                                                                                                                        |
| appId           | String | ``      | The application ID                                                                                                                                 |
| indexName       | String | ``      | The index name                                                                                                                                     |
| query           | String | ``      | The search query                                                                                                                                   |
| queryParameters | Object | ``      | The search query parameters. Available options are [documented here](https://www.algolia.com/doc/api-client/javascript/search/#search-parameters). |

## Slots

| Name    | Description                                                                      |
|:--------|:---------------------------------------------------------------------------------|
| default | Can contain anything. All InstantSearch components will have the index injected. |

## CSS Classes

| ClassName | Description     |
|:----------|:----------------|
| ais-index | Container class |
