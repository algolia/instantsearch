---
title: Searching in *Lists
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 68
---

You can allow the user to search inside lists of items like [`<RefinementList/>`](widgets/RefinementList.html), [`<Menu/>`](widgets/Menu.html) widgets
or [`connectRefinementList`](connectors/connectRefinementList.html) and [`<connectMenu/>`](widgets/Menu.html) connectors.

## Using widgets
Use the `withSearchBox` prop to add a nice search box to supported widgets:
- [`<RefinementList/>`](widgets/RefinementList.html)
- [`<Menu/>`](widgets/Menu.html)

```jsx
<RefinementList attributeName="products" withSearchBox />
```

<div class="storybook-section">
<a class="btn" href="https://community.algolia.com/react-instantsearch/storybook/?selectedKind=RefinementList&selectedStory=with%20search%20for%20facets%20value" target="_blank">View in Storybook</a>
</div>

## Using connectors
You can implement your own search box for searching for items in lists when using
[`connectRefinementList`](connectors/connectRefinementList.html) or
[`connectMenu`](connectors/connectMenu.html) by using those provided props.
* `searchForItems(query)`, call this method with a search query to trigger a new search for items
* `isFromSearch`, When `true` you are in search mode and the provided `items` are search items results

```jsx
import {connectRefinementList} from 'react-instantsearch/connectors';
import {Highlight} from 'react-instantsearch/dom';
const RefinementListWithSearchBox = connectRefinementList(props => {
  const values = props.items.map(item => {
    const label = item._highlightResult
      ? <Highlight attributeName="label" hit={item}/>
      : item.label;
    return <li key={item.value}>
      <span onClick={() => props.refine(item.value)}>
        {label} {item.isRefined ? '- selected' : ''}
      </span>
    </li>;
  });
  return (
    <div>
      <input type="search" onInput={e => props.searchForItems(e.target.value)}/>
      <ul>{values}</ul>
    </div>
  );
});
<RefinementListWithSearchBox attributeName="products"/>
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Default_refinements.html">← Default refinements</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Virtual_widgets.html">Virtual widgets →</a>
    </div>
</div>
