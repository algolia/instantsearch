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
import { connectConfigure, connectHits } from 'instantsearch.js/es/connectors';
import { pagination, refinementList, searchBox } from 'instantsearch.js/es/widgets';
import { Highlight, InstantSearch } from 'ember-instantsearch';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

<template>
  <InstantSearch @searchClient={{searchClient}} @indexName="instant_search" as |ais|>
    <ais.Connector @connector={{connectConfigure}} @params={{hash searchParameters=(hash hitsPerPage=8)}} />
    <ais.Widget @widget={{searchBox}} @params={{hash placeholder="Search for products"}} />
    <ais.Widget @widget={{refinementList}} @params={{hash attribute="brand"}} />
    <ais.Connector @connector={{connectHits}} as |state|>
      {{#each state.items as |hit|}}
        <Highlight @hit={{hit}} @attribute="name" />
      {{/each}}
    </ais.Connector>
    <ais.Widget @widget={{pagination}} />
  </InstantSearch>
</template>
```

The yielded object also has `search` (the InstantSearch.js instance) and `index` (the current index widget). Each component can be imported on its own as well. Then it takes that pair as `@parent`.

### Components

| Component | Connector | Notes |
| --- | --- | --- |
| `InstantSearch` |  | Creates and starts the search. `@indexName`, `@searchClient`, `@onStateChange`, `@searchFunction`, `@stalledSearchDelay` and `@future` can change later. `@routing` and `@initialUiState` apply once. |
| `Index` |  | Searches another index. It yields the widgets again, bound to that index. |
| `Widget` | any | Mounts any InstantSearch.js widget, like `searchBox`, `refinementList` or `pagination`. `@params` are the widget params without `container`. |
| `Highlight` |  | Highlights an attribute of a hit from `connectHits`. |
| `Connector` | any | Yields the render state of any connector, for a custom UI. Without a block it renders nothing, for `connectConfigure`. |

### Any widget

`<ais.Widget>` mounts a widget of InstantSearch.js. The widget renders its own markup, so the options are the ones in the InstantSearch.js docs, such as `templates` and `cssClasses`:

```gjs
import { hash } from '@ember/helper';
import { sortBy } from 'instantsearch.js/es/widgets';

<ais.Widget
  @widget={{sortBy}}
  @params={{hash items=sortItems cssClasses=(hash root="my-sort")}}
/>
```

New `@params` replace the widget and keep its UI state.

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
