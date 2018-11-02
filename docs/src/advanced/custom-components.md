---
title: Custom Components
mainTitle: Advanced
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 4
editable: true
githubSource: docs/src/advanced/custom-components.md
---

> NOTE: this guide **has** been updated for v2

You can build your own components when the provided ones are not sufficient. Since we try as hard as possible to provide an out-of-the-box experience, we would love to hear about your custom component use case before you build it. You can open a new post on our [forum](https://discourse.algolia.com/c/show-tell) to show it to the community!

## What is a custom component

A custom component is a Vue.js component that has access to the currently refined state, results and has possibility to refine the search further.

It can:

- get current refined values
- refine the search more
- remove refinements
- get the search results

## Customizing existing components

First of all, the recommended way to modify how a component works is by filling in its "default" slot. Each component exposes a [scoped slot](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) which provides all information necessary to give a different rendering to this component with the same or similar functionality.

As an example, let's make a custom menu, rendered in a list of buttons. The first step is to have a working default rendering for the menu. This can look like the following: 

```html
<ais-menu attribute="brands"></ais-menu>
```

The next step is to fill in the rendering. Let's not think about making it work yet, but we can get the possible refined values with the slot's value `items`. 

```html
<ais-menu attribute="brands">
  <template slot-scope="{ items }">
    <ul>
      <li v-for="item in items" :key="item.value">
        <button>{{ item.label }}</button>
      </li>
    </ul>
  </template>
</ais-menu>
```

Each component also provides a function called `refine`. This function can be called to apply the action of that component. Here it will toggle the refinement of that value. Let's add that to the click event on that button.

```html
<ais-menu attribute="brands">
  <template slot-scope="{ items }">
    <ul>
      <li v-for="item in items" :key="item.value">
        <button @click="refine(item.value)">
          {{ item.label }}
        </button>
      </li>
    </ul>
  </template>
</ais-menu>
```

More examples of this can be found in the [ais-state-results](components/StateResults.html) component.

## Complete custom components

In some cases, you might want to create a component which uses a piece of data not currently provided by any of the widgets. You also might want to make a custom component for having access to the data in different places than the template.

You can do this with the `createWidgetMixin` function exposed by Vue InstantSearch. It works together with the [connectors](https://community.algolia.com/instantsearch.js/v2/guides/customization.html) from InstantSearch.js. To get started, let's choose the `connectMenu` connector for this example. 

```html
<script>
import { createWidgetMixin } from 'vue-instantsearch';
import { connectMenu } from 'instantsearch.js/es/connectors';

export default {
  mixins: [
    createWidgetMixin({ connector: connectMenu })
  ],
};
</script>
```

Then, all information from that connector will be available to your template as well as your other Vue lifecycle methods (after `created`). All information will be available on `this.state` on your instance, and will be `null` initially (so make sure your code is safe by wrapping usage in the template for example in an `v-if="state"`).

Then we can make use of `state` here to for example filter over the items (note that this is also possible with `transform-items` prop on `ais-menu`):

```js
export default {
  // ...
  computed: {
    items() {
      // no if needed here if we v-if in the template
      // only labels of three character long allowed
      return items.state.items.filter(item => item.label.length === 3)
    }
  }
}
```

Then in our template, we can use this as expected:

```html
<template>
  <ul>
    <li v-for="item in items" :key="item.value">
      <button @click="state.refine(item.value)">
        {{ item.label }}
      </button>
    </li>
  </ul>
</template>
```

Finally, if you want to make your own connector, you can do that using a function with this signature:

```js
const connector = (renderFn, unmountFn) => (widgetParams = {}) => ({
  init({ instantSearchInstance }) {
    renderFn(
      {
        /* anything you put here comes in this.state */
      },
      true
    );
  },

  render({ results, instantSearchInstance }) {
    renderFn(
      {
        /* anything you put here comes in this.state */
      },
      false
    );
  },

  dispose() {
    unmountFn();
  },
});
```

That will give you access to the lowest level of abstraction, including the [Algolia Helper](https://community.algolia.com/algoliasearch-helper-js/reference.html).
