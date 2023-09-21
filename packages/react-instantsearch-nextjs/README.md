<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [react-instantsearch-nextjs](#react-instantsearch-nextjs)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [`<InstantSearchNext>`](#instantsearchnext)
    - [`routing` prop](#routing-prop)
  - [Troubleshooting](#troubleshooting)
  - [Contributing](#contributing)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# react-instantsearch-nextjs

This package provides server-side rendering for [React InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/) that is compatible with [Next.js 13 App Router](https://nextjs.org/docs/app).

> [!WARNING]
> **This package is experimental.**

## Installation

```sh
yarn add react-instantsearch-nextjs
# or with npm
npm install react-instantsearch-nextjs
```

## Usage

> [!NOTE]
> You can check this documentation on [Algolia's Documentation website](https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/#app-router-experimental).

Your search component must be in its own file, and it shouldn't be named `page.js` or `page.tsx`.

To render the component in the browser and allow users to interact with it, include the "use client" directive at the top of your code.

```diff
+'use client';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
} from 'react-instantsearch';

const searchClient = algoliasearch('YourApplicationID', 'YourSearchOnlyAPIKey');

export function Search() {
  return (
    <InstantSearch indexName="YourIndexName" searchClient={searchClient}>
      <SearchBox />
      {/* other widgets */}
    </InstantSearch>
  );
}
```

Import the `<InstantSearchNext>` component from the `react-instantsearch-nextjs` package, and replace the <%= widget_link('instantsearch', 'react') %> component with it, without changing the props.


```diff
'use client';
import algoliasearch from 'algoliasearch/lite';
import {
- InstantSearch,
  SearchBox,
} from 'react-instantsearch';
+import { InstantSearchNext } from 'react-instantsearch-nextjs';

const searchClient = algoliasearch('YourApplicationID', 'YourSearchOnlyAPIKey');

export function Search() {
  return (
-   <InstantSearch indexName="YourIndexName" searchClient={searchClient}>
+   <InstantSearchNext indexName="YourIndexName" searchClient={searchClient}>
      <SearchBox />
      {/* other widgets */}

-   </InstantSearch>
+   </InstantSearchNext>
  );
}
```

To serve your search page at `/search`, create an `app/search` directory. Inside it, create a `page.js` file (or `page.tsx` if you're using TypeScript).

Make sure to [configure your route segment to be dynamic](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic) so that Next.js generates a new page for each request.

```jsx
// app/search/page.js or app/search/page.tsx
import { Search } from './Search'; // change this with the path to your <Search> component

export const dynamic = 'force-dynamic';

export default function Page() {
  return <Search />;
}
```

You can now visit `/search` to see your server-side rendered search page.

## API

### `<InstantSearchNext>`

The `<InstantSearchNext>` component is a drop-in replacement for the `<InstantSearch>` component. It accepts the same props, and it renders the same UI.

You can check the [InstantSearch API reference](https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/) for more information.

### `routing` prop

As with the `<InstantSearch>` component, you can pass a `routing` prop to the `<InstantSearchNext>` component to customize the routing behavior. The difference here is that `routing.router` takes [the same options as the `historyRouter`](https://www.algolia.com/doc/api-reference/widgets/history-router/react/).

## Troubleshooting

If you're experiencing issues, please refer to the [**Need help?**](https://algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/#need-help) section of the docs, or [open a new issue](https://github.com/algolia/instantsearch.js/issues/new?assignees=&labels=triage&template=BUG_REPORT.yml).

## Contributing

We welcome all contributors, from casual to regular 💙

- **Bug report**. Is something not working as expected? [Send a bug report][contributing-bugreport].
- **Feature request**. Would you like to add something to the library? [Send a feature request][contributing-featurerequest].
- **Documentation**. Did you find a typo in the doc? [Open an issue][contributing-newissue] and we'll take care of it.
- **Development**. If you don't know where to start, you can check the open issues that are [tagged easy][contributing-label-easy], the [bugs][contributing-label-bug] or [chores][contributing-label-chore].

To start contributing to code, you need to:

1.  [Fork the project](https://help.github.com/articles/fork-a-repo/)
1.  [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1.  Install the dependencies: `yarn`

Please read [our contribution process](https://github.com/algolia/instantsearch/blob/master/CONTRIBUTING.md) to learn more.

## License

React InstantSearch is [MIT licensed](../../LICENSE).

<!-- Links -->

[contributing-bugreport]: https://github.com/algolia/instantsearch/issues/new?template=BUG_REPORT.yml&labels=triage,Library%3A%20React+InstantSearch
[contributing-featurerequest]: https://github.com/algolia/instantsearch/discussions/new?category=ideas&labels=triage,Library%3A%20React+InstantSearch&title=Feature%20request%3A%20
[contributing-newissue]: https://github.com/algolia/instantsearch/issues/new?labels=triage,Library%3A%20React+InstantSearch
[contributing-label-easy]: https://github.com/algolia/instantsearch/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A+Easy%22+label%3A%22Library%3A%20React+InstantSearch%22
[contributing-label-bug]: https://github.com/algolia/instantsearch/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Bug%22+label%3A%22Library%3A%20React+InstantSearch%22
[contributing-label-chore]: https://github.com/algolia/instantsearch/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Chore%22+label%3A%22Library%3A%20React+InstantSearch%22
