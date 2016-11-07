---
title: Using connectors
layout: guide.pug
category: guide
navWeight: 4
---

While react-instantsearch already provides widgets out of the box, 
there are cases where you need to implement a custom feature that isn't covered by the default widget set.

Connectors are higher order components. They encapsulate the logic for
a specific kind of widget and they provide a way to interact with
the instantsearch context.

As higher order components, they have an outer component API that we call
**exposed props** and they will provide some other props to the wrapped
components which are called the **provided props**.

Connectors are exposed so that you can create your own widgets very easily.

## How to use connectors

All default widgets have a corresponding higher-order component that acts as a connector, providing the required props to the widget.

For instance, if you want to create your own search box, you will need to use the `connectSearchBox` connector:

```javascript
import {connectSearchBox} from 'react-instantsearch/connectors';

const MySearchBox = props =>
  <input
    type="text"
    value={props.query}
    onChange={e => props.refine(e.target.value)}
  />;

// `ConnectedSearchBox` renders a `MySearchBox` component that is connected to
// the InstantSearch state, providing it with `query` and `refine` props for
// reading and manipulating the current query of the search.
// Note that this `ConnectedSearchBox` component will only work when rendered
// as a child or a descendant of the `InstantSearch` component.
const ConnectedSearchBox = connectSearchBox(MySearchBox);
```

### Stateful widgets

While some widgets hold no state, like the `Hits` widget which simply renders the available hits, others do. For instance, the `SearchBox` widget's state is the current query.

When a widget is stateful, its state will get serialized and persisted to the URL. The corresponding URL parameter key can be customized via the widget's `id` prop.

Stateful widgets are also provided with `refine` and `createURL` methods. The `refine(nextState)` method allows the widget to edit its state, while the `createURL(nextState)` method allows the widget to generate a URL for the corresponding state.

```javascript
// Here's a variation on the usage of `connectSearchBox`: a component that just
// renders a link to set the current query to "cute cats".
// By adding an `onClick` handler on top of the `href`, and cancelling the
// default behavior of the link, we avoid making a full-page reload when the
// user clicks on the link, while ensuring that opening the link in a new tab
// still works.
const LookUpCuteCats = connectSearchBox(props =>
  <a
    href={props.createURL('cute cats')}
    onClick={e => {
      e.preventDefault();
      props.refine('cute cats');
    }}
  />
);
```