<p align="left">
  <a href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/">
    <img alt="React InstantSearch" src="https://i.ibb.co/44km5r2/react-widget.png">
  </a>
</p>

[React InstantSearch widget](https://www.algolia.com/?utm_source=react-instantsearch&utm_campaign=repository) that filters the dataset based on **color facet values**.
Equivalent of the official [RefinementList widget](https://www.algolia.com/doc/api-reference/widgets/refinement-list/react/) but displaying a **color indicator** instead of text facet values.

**Compatible with React InstantSearch v7.** For v6 compatibility, please use version 1.4.7.

This helps the user **quickly visualize** the kind of **color** that you have **in your index**. This is a great widget to refine records within multiple shades of a single color (like **choosing the color of a jean** for example).

![Example](https://i.ibb.co/7kDgK8V/example.gif)

---

[![MIT](https://img.shields.io/npm/l/@algolia/react-instantsearch-widget-color-refinement-list)](./LICENSE) [![NPM version](https://img.shields.io/npm/v/@algolia/react-instantsearch-widget-color-refinement-list.svg)](https://npmjs.org/package/@algolia/react-instantsearch-widget-color-refinement-list)

## Summary

- [Demo](#demo)
- [Installation](#installation)
- [Migration from v1](#migration-from-v1)
- [Usage](#usage)
- [Styling](#styling)
  - [CSS variables](#css-variables)
- [Requirements](#requirements)
- [Options](#options)
- [Example](#example)
- [Browser Support](#browser-support)
- [Troubleshooting](#Troubleshooting)
- [Contributing & License](#contributing--license)

# Get started

## Demo

[Demo](https://codesandbox.io/s/github/algolia/react-instantsearch-widget-color-refinement-list?file=/example/index.tsx) on CodeSandbox.

## Installation

### For React InstantSearch v7 (Current)

```bash
npm install @algolia/react-instantsearch-widget-color-refinement-list react-instantsearch
# or
yarn add @algolia/react-instantsearch-widget-color-refinement-list react-instantsearch
```

### For React InstantSearch v6 (Legacy)

If you're still using React InstantSearch v6, install version 1.4.7:

```bash
npm install @algolia/react-instantsearch-widget-color-refinement-list@1.4.7 react-instantsearch-dom
# or
yarn add @algolia/react-instantsearch-widget-color-refinement-list@1.4.7 react-instantsearch-dom
```

## Migration from v1

Upgrading from v1.x (React InstantSearch v6) to v2.x (React InstantSearch v7)?

📖 **See the complete [Migration Guide (v1 → v2)](./MIGRATION_V1_TO_V2.md)** for detailed step-by-step instructions, code examples, and troubleshooting tips.

**Quick Summary:**
- Update dependencies: `react-instantsearch-dom` → `react-instantsearch`
- Update imports and search client initialisation
- Widget API remains unchanged ✅

For additional context, refer to the [React InstantSearch v7 migration guide](https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/).

## Usage

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  ColorRefinementList,
  Layout,
  Shape,
} from '@algolia/react-instantsearch-widget-color-refinement-list';

// Import default styles
import '@algolia/react-instantsearch-widget-color-refinement-list/dist/style.css';

const searchClient = algoliasearch('appId', 'apiKey');

const App = () => (
  <InstantSearch indexName="indexName" searchClient={searchClient}>
    <SearchBox />
    <ColorRefinementList
      attribute="color"
      separator=";"
      layout={Layout.Grid}
      shape={Shape.Circle}
    />
    <Hits />
  </InstantSearch>
);

createRoot(document.getElementById('root')!).render(<App />);
```

## Styling

The widget ships with default styles that you can import either from the NPM package or directly from a CDN like JSDelivr.

```js
import '@algolia/react-instantsearch-widget-color-refinement-list/dist/style.css';
```

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@algolia/react-instantsearch-widget-color-refinement-list/dist/style.css"
/>
```

### CSS variables

The widget styles uses CSS variables that you can customize in your own CSS.  
You can override CSS variables using the `.ais-ColorRefinementList` class.

| Name | Type | Description |
| --- | --- | --- |
| `--transition-duration` | [`time`][css-time] | Transition duration (used for hover, active, refined states). |
| `--items-column-width` | [`length`][css-length] | Items grid column width. |
| `--items-gap` | [`length`][css-length] | Items grid gap. |
| `--refined-icon-size` | [`length`][css-length] | Refined SVG icon size. |
| `--color-size` | [`length`][css-length] | Color swatch size. |

## Requirements

- In your records, color attributes **should have a title and hexadecimal code** separated by a **semicolon `;`** (by default, but it can be customized using the [`separator`](#separator) option) for the widget to work.
- You can also use an URL instead of the hexadecimal code if you want to display a pattern for example.
- The **color** attribute should be added to `attributesForFaceting` in your configuration.

Color facet value examples:

- `black;#000`
- `red;#f00`
- `yellow;#ffff00`
- `pattern;https://example.com/images/pattern.png`

**Note:** The hexadecimal code length can be **3 or 6 chars** (excluding the `#` symbol).

Sample record example:

```json
{
  "objectID": 0,
  "color": "black;#000"
}
```

### Options

| Option | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| [`attribute`](#attribute) | `string` | true | - | Name of the attribute that contains the color in the record. |
| [`sortByColor`](#sortByColor) | `boolean` | false | `true` | Sort facet values by color distance. |
| [`layout`](#layout) | `enum:Grid\|List` | false | `Grid` | UI layout of the facet values. |
| [`shape`](#shape) | `enum:Circle\|Square` | false | `Circle` | UI color shape. |
| [`pinRefined`](#pinRefined) | `boolean` | false | `false` | When displaying the [`showMore`](#showMore) button and the list is not expanded, should the refined items be pinned to the top or remain in the same order. |
| [`limit`](#limit) | `number` | false | `10` | How many facet values to retrieve. |
| [`showMore`](#showMore) | `boolean` | false | `false` | Whether to display a button that expands the number of items. |
| [`showMoreLimit`](#showMoreLimit) | `number` | false | `20` | Maximum number of displayed items. Only used when `showMore` is set to `true`. |
| [`separator`](#separator) | `string` | false | `;` | Color facet value separator. |
| [`className`](#className) | `string` | false | - | Custom CSS classes. |
| [`translations`](#translations) | `object` | false | - | A mapping of keys to translation values. |
| [`transformItems`](#transformItems) | `function` | false | `undefined` | Modifies the items being displayed, for example, to filter or sort them. It takes items as argument and expects them back in return. |

#### attribute

> `string` | **required**

Name of the attribute that contains the color in the record.

```tsx
<ColorRefinementList attribute="color" />
```

#### sortByColor

> `boolean`

Sort facet values by color distance.

```tsx
<ColorRefinementList sortByColor={true} />
```

#### layout

> `enum:'Grid'|'List'`

UI layout of the facet values.

```tsx
import {
  ColorRefinementList,
  Layout,
} from '@algolia/react-instantsearch-widget-color-refinement-list';

<ColorRefinementList layout={Layout.Grid} />;
```

#### shape

> `enum:'Circle'|'Square'`

UI color shape.

```tsx
import {
  ColorRefinementList,
  Shape,
} from '@algolia/react-instantsearch-widget-color-refinement-list';

<ColorRefinementList shape={Shape.Circle} />;
```

#### pinRefined

> `boolean`

When displaying the [`showMore`](#showMore) button and the list is not expanded, should the refined items be pinned to the top or remain in the same order.

```tsx
<ColorRefinementList limit={5} showMore={true} pinRefined={true} />;
```

#### limit

> `number`

How many facet values to retrieve.

```tsx
<ColorRefinementList limit={10} />
```

#### showMore

> `boolean`

Whether to display a button that expands the number of items.

```tsx
<ColorRefinementList showMore={true} />
```

#### showMoreLimit

> `number`

Maximum number of displayed items. Only used when `showMore` is set to `true`.

```tsx
<ColorRefinementList showMoreLimit={20} />
```

#### separator

> `string`

Color facet value separator.

```tsx
<ColorRefinementList separator="//" />
```

#### className

> `string`

Custom CSS classes.

```tsx
<ColorRefinementList className="my-class" />
```

#### translations

> `object`

A mapping of keys to translation values.

- `refineOn`: aria-label value for an item. Accepts one `string` parameter that is the current item value.
- `colors`: aria-label value for items. Accepts one `number` parameter that is the number of items refined.
- `showMore`: the label of the “Show more” button. Accepts one `boolean` parameter that is `true` if the values are expanded, `false` otherwise.

```tsx
<LoadMoreWithProgressBar
  translations={{
    refineOn: (value: string) => `Refine on ${value}`,
    colors: (refinedCount: number) =>
      `Colors${refinedCount ? `, ${refinedCount} selected` : ''}`,
    showMore: (expanded: boolean) =>
      expanded ? 'Show less' : 'Show more',
  }}
/>
```

#### transformItems

> `function`

Modifies the items being displayed, for example, to filter or sort them. It takes items as argument and expects them back in return.

```tsx
<ColorRefinementList
  transformItems={(items) =>
    items.map((item) => ({
      ...item,
      label: item.label.toUpperCase(),
    }))
  }
/>
```

## Example

Clone this repository and go to the repo folder:

```bash
git clone git@github.com:algolia/react-instantsearch-widget-color-refinement-list.git && \
cd react-instantsearch-widget-color-refinement-list
```

Install the dependencies and start the example:

```bash
npm install && npm start
# or
yarn install && yarn start
```

Then open http://localhost:3000/ to see the example in action.

## Browser support

This widget follows the same browser support as React InstantSearch v7:

- **Last two versions of major browsers**: Chrome, Edge, Firefox, Safari
- **React**: 16.8.0 or higher (Hooks support required)
- **Node.js**: 14.x or higher (for development)

Please refer to the [browser support](https://www.algolia.com/doc/guides/building-search-ui/installation/react/#browser-support) section in the documentation to use React InstantSearch and this widget on other browsers.

## Troubleshooting

Encountering an issue? Before reaching out to support, we recommend heading to our [FAQ](https://www.algolia.com/doc/guides/building-search-ui/troubleshooting/faq/react/) where you will find answers for the most common issues and gotchas with the library.

## Contributing & License

### How to contribute

We welcome all contributors, from casual to regular 💙

- **Bug report**. Is something not working as expected? [Send a bug report](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues/new?template=Bug_report.md).
- **Feature request**. Would you like to add something to the library? [Send a feature request](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues/new?template=Feature_request.md).
- **Documentation**. Did you find a typo in the doc? [Open an issue](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues/new) and we'll take care of it.
- **Development**. If you don't know where to start, you can check the open issues that are [tagged easy](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A++++++%E2%9D%84%EF%B8%8F+easy%22), the [bugs](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9D%A4+Bug%22) or [chores](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues?q=is%3Aissue+is%3Aopen+label%3A%22%E2%9C%A8+Chore%22).

To start contributing to code, you need to:

1.  [Fork the project](https://help.github.com/articles/fork-a-repo/)
1.  [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1.  Install the dependencies: `yarn`
1.  Run the development mode: `yarn start`
1.  [Open the project](http://localhost:3000)

Please read [our contribution process](CONTRIBUTING.md) to learn more.

### License

Licensed under the [MIT license](LICENSE).

---

**About React InstantSearch**

React InstantSearch is a React library that lets you create an instant-search result experience using [Algolia][algolia-website]’s search API. It is part of the InstantSearch family:

**React InstantSearch** | [InstantSearch.js][instantsearch.js-github] | [Angular InstantSearch][instantsearch-angular-github] | [Vue InstantSearch][instantsearch-vue-github] | [InstantSearch Android][instantsearch-android-github] | [InstantSearch iOS][instantsearch-ios-github]

This project was generated with [create-instantsearch-app](https://github.com/algolia/create-instantsearch-app) by [Algolia](https://algolia.com).

<!-- Links -->

[algolia-website]: https://www.algolia.com/?utm_source=react-instantsearch&utm_campaign=repository
[instantsearch.js-github]: https://github.com/algolia/instantsearch.js
[instantsearch-angular-github]: https://github.com/algolia/angular-instantsearch
[instantsearch-vue-github]: https://github.com/algolia/vue-instantsearch
[instantsearch-android-github]: https://github.com/algolia/instantsearch-android
[instantsearch-ios-github]: https://github.com/algolia/instantsearch-ios
[css-time]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
[css-length]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
