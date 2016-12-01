---
title: 3rd party UI Libraries
layout: guide.pug
category: guide
navWeight: 500
---

Even if react-instantsearch provides widgets out of the box you are free to use it with
any other React UI library (such as Material-UI, React Toolbox, React-Bootstrap and so
on...). It also applies if you already have components of your own.

To integrate react-instantsearch within another component you can use the **connector provided for each kind of widget**.
Check out the [connectors guide](connectors.html) to learn how to use them.

Let's take an example building a SearchBox using Material UI:

```javascript
import {connectSearchBox} from 'react-instantsearch/connectors';
import {TextField} from 'material-ui';

const MaterialUiSearchBox = props => {
  return <TextField value={props.query}
                    onChange={e => props.refine(e.target.value)}
                    id="SearchBox"
                    hintText="Search for a product..."
  />;
};

const ConnectedSearchBox = connectSearchBox(MaterialUiSearchBox);
```

Then, you will be able to use your `ConnectedSearchBox` inside the `InstantSearch` component:

```javascript
<InstantSearch
      appId="appId"
      apiKey="appKey"
      indexName="indexName">
      <ConnectedSearchBox/>
 </InstantSearch>
```

Basically this strategy will work with any UI libraries. However, if you hit any limitation with the connectors we provide
you can also [create your own connectors](create-own-widget.html).

## Check out our Examples !

In this section you can find several examples based on popular React UI libraries

### Material-UI

[![material-ui-demo](/assets/img/material-ui.gif)](/examples/material-ui)

[View it live](/examples/material-ui), [read the code](http://github.com/algolia/instantsearch.js/tree/v2/docgen/src/examples/material-ui)
