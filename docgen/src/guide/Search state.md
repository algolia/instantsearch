---
title: Search state
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 55
---

The search state contains all widgets states.
If a widget uses an attribute, we store it under its widget category to prevent collision.

Here's the search state shape for all the connectors or widgets that we provide:

## (connect)Range

```javascript
{
  range: {
    attributeName: {
      min: 2,
      max: 3
    }
  }
}
```

## (connect)RefinementList

```javascript
{
  refinementList: {
    attributeName: ['lemon', 'orange']
  }
}
```

## (connect)HierarchicalMenu

```javascript
{
  hierarchicalMenu: {
    attributeName: 'fruits > orange'
  }
}
```

## (connect)HitsPerPage

```javascript
{
  hitsPerPage: 10
}
```

## (connect)Menu

```javascript
{
  menu: {
    attributeName: 'orange'
  }
}
```

## (connect)MultiRange

```javascript
{
  multiRange: {
    attributeName: '2:3'
  }
}
```

## (connect)Toggle

```javascript
{
  toggle: {
    attributeName: true
  }
}
```

## (connect)SortBy

```javascript
{
  sortBy: 'mostPopular'
}
```

## (connect)SearchBox state

```javascript
{
  query: 'ora'
}
```

## (connect)Pagination

```javascript
{
  page: 2
}
```

## (connect)InfiniteHits

```javascript
{
  page: 2
}
```

<div class="guide-nav">
Next: <a href="/guide/Multi index.html">Multi index →</a>
</div>
