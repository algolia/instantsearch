---
title: Integration with other React UI Libraries
layout: api.pug
nav_groups:
  - core
nav_sort: 1
---

# Integration with other React UI Libraries

Even if react-instantsearch provides widgets out of the box you are free to use it with
any other React UI library (such as Material-UI, React Toolbox, React-Bootstrap and so
on...). It also applies if you already have components of your own.

To integrate react-instantsearch with another component you can use the **default connector provided by each widget**.
Once connected, react-instantsearch widgets will behave as High-Order Components.
More on that on the [making your own widgets](Customization.html#making-your-own-widgets) documentation.

Let's take an example building a SearchBox using Material UI:

```js
import {SearchBox} from 'react-instantsearch';
import {TextField} from 'material-ui';

const MaterialUiSearchBox = props => {
  return <TextField value={props.query}
                    onChange={e => props.refine(e.target.value)}
                    id="SearchBox"
                    hintText="Search for a product..."
  />;
};

const ConnectedSearchBox = SearchBox.connect(MaterialUiSearchBox);
```

Then, you will be able to use your `ConnectedSearchBox` inside the `InstantSearch` component:

```js
<InstantSearch
      appId="appId"
      apiKey="appKey"
      indexName="indexName">
      <ConnectedSearchBox/>
 </InstantSearch>
```

Basically this strategy will work with any UI libraries. However, if you hit any limitation with the default connectors
you can also [create your own connectors](Customization.html#creating-your-own-connectors).

## Check out our Examples !

In this section you can find several examples based on popular React UI libraries

### Material-UI

<script src="webpack.assets[`assets/img/examples/ecommerce.png>"></script>

[![material-ui-demo](assets/img/examples/material-ui.gif)](MaterialUI.html)

[View it live](MaterialUI.html)

[View code](http://github.com/algolia/instantsearch.js/tree/v2/docgen/assets/js/examples/material-ui)
