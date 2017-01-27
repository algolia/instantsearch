---
title: Highlighting results
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 78
---

Search is all about helping users understand the results. This is especially true when using
text based search. When a user types a query in the searchbox, the results
must show why the results are matching the query. That's why Algolia implements
a powerful highlight that lets you display the matching parts of text attributes in
the results.

This feature is already packaged for you in react-instantsearch and
like most of its features it comes in two flavors, depending on your use case:
 - when using the DOM, widgets is the way to go
 - when using another rendering (such as react native), you will use the connector

## &lt;Highlight&gt; and &lt;Snippet&gt; widgets

Highlighting is based on the results and you will need to make a custom Hit in order
to use the Highlighter. The Highlight and the Snippet widgets takes two props:
 - attributeName: the path to the highlighted attribute
 - hit: a single result object

**Notes:**
* Use the `<Highlight>` widget when you want to display the regular value of an attribute.
* Use the `<Snippet>` widget when you want to display the snippet version of an attribute.

Here is an example in which we create a custom Hit widget for results that have a
`description` field that is highlighted.

```jsx
import React from 'react';

import {InstantSearch, Hits, Highlight} from 'InstantSearch';

const Hit = ({hit}) =>
<p>
  <Highlight attributeName="description" hit={hit}/>
</p>;

export default function App() {
  return (
    <InstantSearch
       appId="latency"
       apiKey="6be0576ff61c053d5f9a3225e2a90f76"
       indexName="ikea">
      <Hits hitComponent={Hit} />
    </InstantSearch>
  );
}
```

## connectHighlight connector

The connector provides a function that will extract the highlighting data
from the results. This function takes a single parameter object with three
properties:
 - attributeName: the highlighted attribute name
 - hit: a single result object
 - path: the path to the structure containing the highlighted attribute

Those parameters are taken from the context in which the the custom component
is used, therefore it's reasonable to have them as props.

Here is an example of a custom Highlight widget. It can be used the same
way as the [widgets](guide/Highlighting_results.html#highlight-and-snippet-widgets).

```jsx
const CustomHighlight = connectHighlight(({highlight, attributeName, hit}) => {
  const parsedHit = highlight({attributeName, hit, highlightProperty: 'highlightProperty'});
  return parsedHit.map(part => {
    if(part.isHighlighted) return <em>{part.value}</em>;
    return part.value;
  });
});
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Styling_widgets.html">← Styling Widgets</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/i18n.html">i18n →</a>
    </div>
</div>
