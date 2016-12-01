---
title: InstantSearch state
layout: guide.pug
category: guide
navWeight: 600
---

The `InstantSearch` state contains all widgets states. 
If a widget uses an attribute, we store it under its widget category to prevent collision. 

Here's the `InstantSearch` state shape for all the connectors or widgets that we provide:

### Range state

```javascript
{
  range: {
    attributeName: {
      min: 'min_value',
      max: 'max_value'
    }
  }
}
```
### RefinementList state

```javascript
{
  refinementList: {
      attributeName: ['value']
    }
}
```

### HierarchicalMenu state

```javascript
{
  hierarchicalMenu: {
      attributeName: 'value'
    }
}
```

### HitsPerPage state

```javascript
{
  hitsPerPage: 10
}
```

### Menu state

```javascript
{
  menu: {
      attributeName: 'value'
    }
}
```

### MultiRange state

```javascript
{
  multiRange: {
    attributeName: 'min_value:max_value'
    }
}
```
### Toggle state

```javascript
{
  toggle: {
    attributeName: 'true || false'
    }
}
```

### SortBy state

```javascript
{
  sortBy: 'index_name'
}
```

### SearchBox state

```javascript
{
  query: 'query_value'
}
```

### Pagination state

```javascript
{
  page: 2
}
```

### InfiniteHits state

```javascript
{
  page: 2
}
```