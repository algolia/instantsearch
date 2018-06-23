---
title: Connectors
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 75
---

React InstantSearch provides [widgets](guide/Widgets.html) out of the box, those are great when you want
a default style to be applied and you do not need heavy customization of the underlying DOM or behavior of
the widget.

## When do I need to use connectors?

* When you want to display our widgets using another UI library like [Material-UI](http://www.material-ui.com/)
* When you want to have full control on the rendering without having to reimplement business logic
* As soon as you hit a feature wall using our default widgets
* When you are a react-native user, read our [react-native guide](guide/React_native.html)

## What are connectors?

Connectors are higher order components. They encapsulate the logic for
a specific kind of widget and they provide a way to interact with
the instantsearch context.

As higher order components, they have an outer component API that we call
**exposed props** and they will provide some other props to the wrapped
components which are called the **provided props**.

## How to use them?

If you want to create your own search box, you will need to use the [`connectSearchBox()`](connectors/connectSearchBox.html) connector.

Note that this connected component will only work when rendered as a child or a descendant of the [`<InstantSearch>`](guide/\<InstantSearch\>.html) component.

```jsx
import { connectSearchBox } from 'react-instantsearch-dom';

const MySearchBox = ({currentRefinement, refine}) =>
  <input
    type="text"
    value={currentRefinement}
    onChange={e => refine(e.target.value)}
  />;

// `ConnectedSearchBox` renders a `<MySearchBox>` widget that is connected to
// the <InstantSearch> state, providing it with `currentRefinement` and `refine` props for
// reading and manipulating the current query of the search.
const ConnectedSearchBox = connectSearchBox(MySearchBox);
```

## Exposed props

Connectors expose props to configure their behavior. Like the `attribute`
being refined in a [`<Menu>`](widgets/Menu.html).

One common exposed prop that you can use is the `defaultRefinement` one. Use it when as a way to provide the
[default refinement](guide/Default_refinements.html) when the connected component will be mounted.

## Provided props

Provided props always follow the same pattern for ease of use:
- `currentRefinement`: Search state representation of the connector, most of the time you do not need that
- `refine`: Function to call to refine the search state of the connector
- `createURL`: See the [routing guide](guide/Routing.html)
- `items[{label, value, count, isRefined}]`: Only when dealing with list based connectors
  - `label`: Text representation of the item to be shown
  - `value`: State representation to be used when calling `refine()` or `createURL()`
  - `count`: Number of hits concerned by the facet
  - `isRefined`: Indicates if the item is currently selected refining the search state

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Sorting_and_filtering.html">← Sorting and filtering items</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Default_refinements.html">Default refinements →</a>
    </div>
</div>
