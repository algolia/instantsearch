# instantsearch.js-widget



---

[![MIT](https://img.shields.io/npm/l/)](./LICENSE) [![NPM version](http://img.shields.io/npm/v/.svg)](https://npmjs.org/package/)

## Install

```bash
npm install 
# or
yarn add 
```

## Widget

### Usage

```js
import instantsearch from 'instantsearch.js';
import algoliasearch from 'algoliasearch/lite';
import {  } from '';

const searchClient = algoliasearch('appId', 'apiKey');

const search = instantsearch({
  indexName: 'indexName',
  searchClient,
});

search.addWidgets([
  ({
    // widget parameters
  }),
]);

search.start();
```

### Options

| Option | Type | Required | Default | Description |
| :-- | :-- | :-- | :-- | --- |
| [`container`](#container) | `string` or `HTMLElement` | true | - | The element to insert the widget into. |
| [`option1`](#option1) | `...` | true | - | REPLACE WITH THE DESCRIPTION FOR THIS OPTION |

#### container

> `string | Element` | **required**

The element to insert the widget into.

This can be either a valid CSS Selector:

```js
({
  container: '#instantsearch.js-widget',
  // ...
});
```

or an `HTMLElement`:

```js
({
  container: document.querySelector('#instantsearch.js-widget'),
  // ...
});
```

#### option1

> `...` | **required**

REPLACE WITH THE DESCRIPTION FOR THIS OPTION

```js
({
  option1: 'value',
  // ...
});
```

## Connector

### Usage

```js
import { connect } from '';

// 1. Create a render function
const render = (renderOptions, isFirstRender) => {
  // Rendering logic
};

// 2. Create the custom widget
const custom = connect(
  render
);

// 3. Instantiate
search.addWidgets([
  custom({
    // instance params
  }),
]);
```

### Options

#### option1

> `...`

REPLACE WITH THE DESCRIPTION FOR THIS RENDERING ITEM

```js
const render = (renderOptions, isFirstRender) => {
  // show how to use this render option
};

const custom = connect(
  render,
);

search.addWidgets([
  custom({
    // ...
  }),
]);
```

#### widgetParams

> `object`

All original widget options forwarded to the render function.

```js
const render = (renderOptions, isFirstRender) => {
  const { widgetParams } = renderOptions;
  widgetParams.container.innerHTML = '...';
};

const custom = connect(
  render,
);

search.addWidgets([
  custom({
    container: document.querySelector('#instantsearch.js-widget'),
    // ...
  }),
]);
```

## Contributing

To start contributing to code, you need to:

1. [Fork the project](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
2. [Clone the repository](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository)
3. Install the dependencies: `yarn`
4. Run the development mode: `yarn start`

Please read [our contribution process](./CONTRIBUTING.md) to learn more.

---

_This project was generated with [create-instantsearch-app](https://github.com/algolia/instantsearch/tree/master/packages/create-instantsearch-app) by [Algolia](https://algolia.com)._
