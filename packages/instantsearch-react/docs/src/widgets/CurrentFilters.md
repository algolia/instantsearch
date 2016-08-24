---
title: CurrentFilters
layout: api.ejs
nav_groups:
  - main
---

# CurrentFilters

Displays the list of filters currently applied to the search parameters.

## Props

Name | Type | Default |Description
:- | :- | :- | :-


### Theme

`root`, `filters`, `filter`, `filterLabel`, `filterClear`, `clearAll`

### Translations

`clearFilter`, `clearAll`

## Implementing your own CurrentFilters

See [Making your own widgets](../Customization.md) for more information on how to use the `connectCurrentFilters` HOC.

```
import {connectCurrentFilters} from 'instantsearch-react';

function MyCurrentFilters(props) {
  return (
    <div>
      {props.filters.map(filter =>
        <div key={filter.key}>
          {filter.label}
          <button
            onClick={() => props.refine([filter])}
          >
            Clear
          </button>
        </div>
      )}
      <button
        onClick={() => props.refine(props.filters)}
      >
        Clear all
      </button>
    </div>
  );
}

export default connectCurrentFilters(MyCurrentFilters);
```
