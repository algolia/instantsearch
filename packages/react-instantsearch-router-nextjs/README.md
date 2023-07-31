<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [react-instantsearch-router-nextjs](#react-instantsearch-router-nextjs)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
  - [Troubleshooting](#troubleshooting)
  - [Contributing](#contributing)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# react-instantsearch-router-nextjs

This package is a router for [React InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/) that is compatible with [Next.js](https://nextjs.org/) routing.

> :warning: **This function cannot be used in conjunction with [`getStaticProps()`](https://nextjs.org/docs/api-reference/data-fetching/get-static-props). Use `getServerSideProps()` or client-side rendering instead.**

## Installation

```sh
yarn add react-instantsearch-router-nextjs
# or with npm
npm install react-instantsearch-router-nextjs
```

## Usage

You need to pass the Next.js router singleton that you can import from `next/router`.

If you are doing SSR with the `getServerState` and `InstantSearchSSRProvider` from `react-instantsearch/server`, you need to pass the `url` prop to `createInstantSearchRouterNext`'s `serverUrl` option :

```js
import singletonRouter from 'next/router';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

export default function Page({ serverState, url }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        routing={{ router: createInstantSearchRouterNext({ singletonRouter, serverUrl: url }) }}
      >
        {/* ... */}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}
```

If you are not doing SSR but only CSR, you can omit the `serverUrl` option:

```js
import singletonRouter from 'next/router';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

export default function Page() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      routing={{ router: createInstantSearchRouterNext({ singletonRouter }) }}
    >
      {/* ... */}
    </InstantSearch>
  );
}
```

Lastly, if you had custom routing logic in your app, you can pass it to the `createInstantSearchRouterNext`'s `routerOptions` option:

```js
import singletonRouter from 'next/router';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

export default function Page({ serverState, url }) {
  return (
    {/* ... */}
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        routing={{
          router: createInstantSearchRouterNext({
            singletonRouter,
            serverUrl: url,
            routerOptions: {
              createURL: /* ... */,
              parseURL: /* ... */,
            },
          }),
           // if you are using a custom `stateMapping` you can still pass it :
          stateMapping: /* ... */,
        }}
      >
        {/* ... */}
      </InstantSearch>
    {/* ... */}
  );
}
```

## API

The options are :

- `singletonRouter: SingletonRouter`: the required Next.js router singleton.
- `serverUrl?: string`: the URL of the page on the server. Required if you are doing SSR with `getServerState` and `InstantSearchSSRProvider`.
- `routerOptions?: RouterOptions`: the options passed to the `history` router. See [the documentation](https://www.algolia.com/doc/api-reference/widgets/history-router/js/) for more details.

For troubleshooting purposes, some other options are available :

- `beforeStart?: (onUpdate: () => void) => void`: a function called before the router starts. You can use it to inform InstantSearch to update on router events by calling `onUpdate`.
- `beforeDispose?: () => void`: a function called before the router disposes. You can use it to clean up handlers you added in `beforeStart`.
- `beforePopState?: (options: { state: NextHistoryState, ownBeforePopState: BeforePopStateCallback, libraryBeforePopState: BeforePopStateCallback }) => boolean`: a function used by the Next.js router to know whether it should trigger SSR when using back/forward buttons. You can use it to override the default one by writing your own logic. The `ownBeforePopState` is the pre-existing handler that you may have set yourself, and the `libraryBeforePopState` is the default one from the library.

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

Please read [our contribution process](https://github.com/algolia/instantsearch.js/blob/master/CONTRIBUTING.md) to learn more.

## License

React InstantSearch is [MIT licensed](../../LICENSE).

<!-- Links -->

[contributing-bugreport]: https://github.com/algolia/instantsearch.js/issues/new?template=BUG_REPORT.yml&labels=triage,Library%3A%20React+InstantSearch
[contributing-featurerequest]: https://github.com/algolia/instantsearch.js/discussions/new?category=ideas&labels=triage,Library%3A%20React+InstantSearch&title=Feature%20request%3A%20
[contributing-newissue]: https://github.com/algolia/instantsearch.js/issues/new?labels=triage,Library%3A%20React+InstantSearch
[contributing-label-easy]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A+Easy%22+label%3A%22Library%3A%20React+InstantSearch%22
[contributing-label-bug]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Bug%22+label%3A%22Library%3A%20React+InstantSearch%22
[contributing-label-chore]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Chore%22+label%3A%22Library%3A%20React+InstantSearch%22
