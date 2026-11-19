# Ember InstantSearch

> ⚡ Lightning-fast search for Ember, by Algolia

Ember InstantSearch renders search UIs with [InstantSearch.js](../instantsearch.js). The same connectors drive React InstantSearch and Vue InstantSearch, and the widgets render the same markup and `ais-*` class names, so the [`instantsearch.css`](../instantsearch.css) themes apply.

It needs `ember-source` 7.1 or later.

## Installation

```sh
npm install ember-instantsearch instantsearch.js algoliasearch
```

## Usage

`<InstantSearch>` creates the search and yields the widgets, bound to the main index:

```gjs
import { hash } from '@ember/helper';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Highlight, InstantSearch } from 'ember-instantsearch';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

<template>
  <InstantSearch @searchClient={{searchClient}} @indexName="instant_search" as |ais|>
    <ais.Configure @searchParameters={{hash hitsPerPage=8}} />
    <ais.SearchBox @placeholder="Search for products" />
    <ais.RefinementList @attribute="brand" />
    <ais.Hits as |hit|>
      <Highlight @hit={{hit}} @attribute="name" />
    </ais.Hits>
    <ais.Pagination />
  </InstantSearch>
</template>
```

The yielded object also has `search` (the InstantSearch.js instance) and `index` (the current index widget). Each component can be imported on its own as well. Then it takes that pair as `@parent`.

### Components

| Component | Connector | Notes |
| --- | --- | --- |
| `InstantSearch` |  | Creates and starts the search. `@indexName`, `@searchClient`, `@onStateChange`, `@searchFunction`, `@stalledSearchDelay` and `@future` can change later. `@routing` and `@initialUiState` apply once. |
| `Index` |  | Searches another index. It yields the widgets again, bound to that index. |
| `Configure` | `connectConfigure` | Renders nothing, unless it has a block. |
| `SearchBox` | `connectSearchBox` | `@searchAsYouType`, `@ignoreCompositionEvents`, `@queryHook`, `@autofocus`, `@placeholder`. |
| `Hits` | `connectHits` | The block gets each hit and `sendEvent`. Without a block, it shows the JSON of each hit. |
| `RefinementList` | `connectRefinementList` | `@searchable` and `@showMore` included. |
| `Pagination` | `connectPagination` |  |
| `Highlight` |  | Highlights an attribute of a hit. |
| `Connector` | any | Yields the render state of any connector, for a custom UI. |

### Any connector

`<ais.Connector>` yields the render state of any connector:

```gjs
import { connectStats } from 'instantsearch.js/es/connectors';

<ais.Connector @connector={{connectStats}} as |stats|>
  {{stats.nbHits}} results
</ais.Connector>
```

In a component class, `useConnector` does the same:

```gts
import Component from '@glimmer/component';
import { connectStats } from 'instantsearch.js/es/connectors';
import { useConnector, type Parent } from 'ember-instantsearch';

export default class Stats extends Component<{ Args: { parent: Parent } }> {
  stats = useConnector(this, () => this.args.parent, connectStats, () => ({}));

  <template>{{this.stats.state.nbHits}} results</template>
}
```

The widget joins the index when the component renders and leaves it when the component is destroyed. The render state is autotracked. When the params change by value, a new widget takes the place of the old one and keeps the UI state that it owns.

## Development

Build the libraries from the root of the repository first:

```sh
yarn lerna run build --scope ember-instantsearch --include-dependencies
```

Then, in this folder:

```sh
yarn test        # Vitest, in Chrome
yarn type-check  # ember-tsc
```

The tests run in a real browser, because Ember apps do not run in Node or in a fake DOM. They include the shared suites from [`tests/common`](../../tests/common), the same ones that the other flavors run.

## License

Ember InstantSearch is [MIT licensed](LICENSE).
