# {{name}}

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

```jsx
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch-dom';
import { {{ pascalCaseName }} } from '{{ packageName }}';

const searchClient = algoliasearch('appId', 'apiKey');

const App = () => (
  <InstantSearch searchClient={searchClient} indexName="indexName">
    <{{ pascalCaseName }} />
  </InstantSearch>
);
```

### Options

| Option | Type | Required | Default | Description |
| :-- | :-- | :-- | :-- | --- |
| [`option1`](#option1) | `string` | true | - | REPLACE WITH THE DESCRIPTION FOR THIS OPTION |

#### option1

> `string` | **required**

REPLACE WITH THE DESCRIPTION FOR THIS OPTION

## Connector

### Usage

```jsx
import { connect{{ pascalCaseName }} } from '{{ packageName }}';

// 1. Create a render function
const Render{{ pascalCaseName }} = (renderOptions, isFirstRender) => {
  // Rendering logic
};

// 2. Create the custom widget
const Custom{{ pascalCaseName }} = connect{{ pascalCaseName }}(
  Render{{ pascalCaseName }}
);

// 3. Instantiate
const App = () => (
  <InstantSearch searchClient={searchClient} indexName="indexName">
    <Custom{{ pascalCaseName }} />
  </InstantSearch>
);
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
