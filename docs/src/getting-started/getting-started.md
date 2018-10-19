---
title: Getting started
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 1
editable: true
githubSource: docs/src/getting-started/getting-started.md
---

> NOTE: this guide **has** been updated for v2

## Welcome to Vue InstantSearch

Vue InstantSearch is the ultimate toolbox for creating instant search
experiences using [Vue.js](https://vuejs.org/) and [Algolia](https://www.algolia.com/).

## Setup a new Vue project

We'll use the official [vue-cli](https://cli.vuejs.org) to bootstrap a new Vue project.

```shell
$ npm install --global @vue/cli
$ vue create vue-instantsearch-getting-started
```

**Info:** Default settings are enough, hit `Enter ⏎` at every question.

Then go to the created folder and open it in your editor.

```shell
$ cd vue-instantsearch-getting-started
```

## Install `vue-instantsearch`

Add Vue InstantSearch as a dependency, it's published on [npm](https://www.npmjs.com):

```shell
$ npm install vue-instantsearch@alpha
```

## Run the development environment

When `vue-cli` bootstrapped the project, it added some [npm scripts](https://docs.npmjs.com/misc/scripts) to your project, like a `serve` one for development. Let's use it:

```shell
$ npm run serve
```

This should open a new tab in your browser with this inside:

![Screenshot showing the new tab preview when npm run dev starts](images/getting-started-npm-run-dev.png).

Leave the `serve` script running, we will update the code and it will reload in your browser
automatically.

## Use the InstantSearch plugin

Now we need to tell Vue to use the Vue InstantSearch plugin so that all search
components are available in our templates.

Open the `src/main.js` entry point and replace the existing content with the following:

```javascript
import Vue from 'vue';
import App from './App.vue'
import InstantSearch from 'vue-instantsearch';

Vue.use(InstantSearch);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

From now on, you can use all [Vue InstantSearch components](getting-started/using-components.html) in your templates throughout the whole application.

## Create your first search experience

Let's bootstrap a small search interface.

Open the `src/App.vue` component. Then replace the whole beginning of the file, between the `<template></template>` tags, with the following:

```vue
<template>
  <ais-instant-search
    :search-client="searchClient"
    index-name="instant_search"
  >
    <ais-search-box/>
    <ais-hits>
      <template slot="item" slot-scope="{ item }">
        <h2>
          <ais-highlight :hit="item" attribute="name" />
        </h2>
      </template>
    </ais-hits>
  </ais-instant-search>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

export default {
  data() {
    return {
      searchClient: algoliasearch(
        'latency',
        '3d9875e51fbd20c7754e65422f7ce5e1'
      ),
    };
  },
};
</script>
```

Save, and see the result in the browser. Play with it!

![Animated screenshot showing a first search experience](images/first-search-experience.gif).

## How it works

In this section you'll learn a bit more about what you just implemented.

### The `ais-instant-search` component

All search components need to be wrapped in an `ais-instant-search` component.

```vue
<ais-instant-search
  :search-client="searchClient"
  index-name="instant_search"
>
  <!-- Search components go here -->
</ais-instant-search>

<script>
import algoliasearch from 'algoliasearch/lite';

export default {
  data() {
    return {
      searchClient: algoliasearch('latency', '3d9875e51fbd20c7754e65422f7ce5e1');
    };
  },
};
</script>
```

You should configure the `ais-instant-search` component with the application ID and API search only key.

The job of the `ais-instant-search` component is to hold the state of the search, and to provide it to child components.

### Algolia demo credentials

For the demo, we provided you with some default Algolia credentials:

 - `app-id`: `latency`
 - `search-key`: `3d9875e51fbd20c7754e65422f7ce5e1`
 - `index-name`: `instant_search`

When you are ready to go further, you can [create your own Algolia account](https://www.algolia.com/users/sign_up) and [find your credentials](https://www.algolia.com/api-keys) in the Algolia dashboard.

### The Search Box component

The [Search Box component](components/SearchBox.html) renders a text input.

The text input value is bound to the query of the current search.

Every time the query changes, the search store will contact Algolia to get the new results for the new query.

**Info:** The Search Box component is wrapped into a `<form>` element and provides a reset and submit button by default. These [good search practices are explained here](https://blog.algolia.com/mobile-search-ux-tips/).

### The Hits component

The [Hits component](components/Hits.html) will loop over all results returned
by the Algolia response, and display them.

The component has a [scoped slot](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) so that you can easily define your custom template for the rendering of every single result.

**Info:** By default, if no slot is provided, the component will display the `objectID` of every result.

The slot provided by the Hits component is a [scoped slot](https://vuejs.org/v2/guide/components.html#Scoped-Slots).

A scoped slot means that the template can access data passed to the slot.

This is illustrated by this snippet:

```html
<template slot="item" slot-scope="parameters">
  <h1>{{ parameters.item.name }}</h1>
</template>
```

or with an ES6 syntax:

```html
<template slot="item" slot-scope="{ item }">
  <h1>{{ item.name }}</h1>
</template>
```

Now that `item` is available, we can customize the html inside the template.

In the example we provided, we display the highlighted version of the name of the result.

## Going further

Now that we have seen the basics of using Algolia with Vue InstantSearch, let's go further by looking at the [list of exposed components](getting-started/using-components.html)
