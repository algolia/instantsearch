# {{ name }}

{{ description }}

---

[![MIT](https://img.shields.io/npm/l/{{ packageName }})](./LICENSE) [![NPM version](http://img.shields.io/npm/v/{{ packageName }}.svg)](https://npmjs.org/package/{{ packageName }})

## Install

```bash
npm install {{ packageName }}
# or
yarn add {{ packageName }}
```

## Widget

### Usage

```js
import instantsearch from 'instantsearch.js';
import algoliasearch from 'algoliasearch/lite';
import { {{ camelCaseName }} } from '{{ packageName }}';

const searchClient = algoliasearch('appId', 'apiKey');

const search = instantsearch({
  indexName: 'indexName',
  searchClient,
});

search.addWidgets([
  {{ camelCaseName }}({
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
{{ camelCaseName }}({
  container: '#{{ name }}',
  // ...
});
```

or an `HTMLElement`:

```js
{{ camelCaseName }}({
  container: document.querySelector('#{{ name }}'),
  // ...
});
```

#### option1

> `...` | **required**

REPLACE WITH THE DESCRIPTION FOR THIS OPTION

```js
{{ camelCaseName }}({
  option1: 'value',
  // ...
});
```

## Connector

### Usage

```js
import { connect{{ pascalCaseName }} } from '{{ packageName }}';

// 1. Create a render function
const render{{ pascalCaseName }} = (renderOptions, isFirstRender) => {
  // Rendering logic
};

// 2. Create the custom widget
const custom{{ pascalCaseName }} = connect{{ pascalCaseName }}(
  render{{ pascalCaseName }}
);

// 3. Instantiate
search.addWidgets([
  custom{{ pascalCaseName }}({
    // instance params
  }),
]);
```

### Options

#### option1

> `...`

REPLACE WITH THE DESCRIPTION FOR THIS RENDERING ITEM

```js
const render{{ pascalCaseName }} = (renderOptions, isFirstRender) => {
  // show how to use this render option
};

const custom{{ pascalCaseName }} = connect{{ pascalCaseName }}(
  render{{ pascalCaseName }},
);

search.addWidgets([
  custom{{pascalCaseName }}({
    // ...
  }),
]);
```

#### widgetParams

> `object`

All original widget options forwarded to the render function.

```js
const render{{ pascalCaseName }} = (renderOptions, isFirstRender) => {
  const { widgetParams } = renderOptions;
  widgetParams.container.innerHTML = '...';
};

const custom{{ pascalCaseName }} = connect{{ pascalCaseName }}(
  render{{ pascalCaseName }},
);

search.addWidgets([
  custom{{ pascalCaseName }}({
    container: document.querySelector('#{{ name }}'),
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
