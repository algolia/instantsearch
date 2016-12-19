---
title: Search for facet values
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 68
---

If you use the [`<RefinementList/>`](widgets/RefinementList.html) widget or the [`connectRefinementList`](connectors/connectRefinementList.html)
connector then the end user can choose multiple values for a specific facet. If a facet has a lot of possible values then you can decide 
to let the end user search inside them before selecting them. This feature is called search for facet values. 

## with widgets

To activate the search for facet values when using the [`<RefinementList/>`](widgets/RefinementList.html) widget you need to pass the `searchForFacetValues` 
boolean as a prop.

If activated, the refinement list should display an input to search for facet values.

```javascript
<RefinementList attributeName="attributeName" searchForFacetValues/>
```

<a class="btn" href="https://community.algolia.com/instantsearch.js/react/storybook/?selectedKind=RefinementList&selectedStory=with%20search%20for%20facets%20value" target="_blank">View in Storybook</a>

## with connectors

When using the [`connectRefinementList`](connectors/connectRefinementList.html) connector, you have two provided props related to the search
for facet values behavior:

* `isSearchFrom`, If `true` this boolean indicate that the `items` prop contains the search for facet values results. 
* `searchForFacetValues`, a function to call when triggering the search for facet values. It takes one parameter, the search 
for facet values query. 

You will also need to pass the `searchForFacetValues` boolean as a prop.

```javascript
import {connectRefinementList} from '../packages/react-instantsearch/connectors';
import {Highlight} from '../packages/react-instantsearch/dom';

const RefinementListWithSFFV = connectRefinementList(props => {
  const values = props.items.map(item => {
    const label = item._highlightResult
      ? <Highlight attributeName="label" hit={item}/>
      : item.label;
      
    return <li key={item.value}>
      <a onClick={() => props.refine(item.value)}>
        {label} {item.isRefined ? '- selected' : ''}
      </a>
    </li>;
  });
  return (
    <div>
      <input type="search" onChange={e => props.searchForFacetValues(e.target.value)}/>
      <ul>{values}</ul>
    </div>
  );
});

<RefinementListWithSFFV attributeName="attributeName" searchForFacetValues/>
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Default_refinements.html">← Default refinements</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Virtual_widgets.html">Virtual widgets →</a>
    </div>
</div>