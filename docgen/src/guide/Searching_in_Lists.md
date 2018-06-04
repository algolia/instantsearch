---
title: Searching in *Lists
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 68
---

You can allow the user to search inside lists of items like [`<RefinementList>`](widgets/RefinementList.html), [`<Menu>`](widgets/Menu.html) widgets
or [`connectRefinementList`](connectors/connectRefinementList.html) and [`connectMenu`](widgets/Menu.html) connectors.

In order to make this feature work, you'll also need to make the attribute searchable [using the API](https://www.algolia.com/doc/guides/searching/faceting/?language=js#declaring-a-searchable-attribute-for-faceting) or [the dashboard](https://www.algolia.com/explorer/display/).

## Using widgets

Use the `searchable` prop to add a nice search box to supported widgets:

- [`<RefinementList>`](widgets/RefinementList.html)
- [`<Menu>`](widgets/Menu.html)

```jsx
<RefinementList attribute="products" searchable />
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
import { Highlight, connectRefinementList } from 'react-instantsearch-dom';

const RefinementListWithSearchBox = connectRefinementList(props => {
  const values = props.items.map(item => {
    const label = item._highlightResult
      ? <Highlight attribute="label" hit={item}/>
      : item.label;

    return (
      <li key={item.value}>
        <span onClick={() => props.refine(item.value)}>
          {label} {item.isRefined ? '- selected' : ''}
        </span>
      </li>
    );
  });

  return (
    <div>
      <input type="search" onInput={e => props.searchForItems(e.target.value)}/>
      <ul>{values}</ul>
    </div>
  );
});

<RefinementListWithSearchBox attribute="products" />
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Default_refinements.html">← Default refinements</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Virtual_widgets.html">Virtual widgets →</a>
    </div>
</div>
