<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [react-instantsearch-hooks-server](#react-instantsearch-hooks-server)
  - [Installation](#installation)
  - [Getting started](#getting-started)
  - [API reference](#api-reference)
  - [Documentation](#documentation)
  - [Contributing](#contributing)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# react-instantsearch-hooks-server

React InstantSearch Hooks is an open-source, **UI library** for React that lets you server-side render a search interface.

Server-side rendering (SSR) lets you generate HTML from InstantSearch components on the server. React InstantSearch Hooks is compatible with server-side rendering. The library provides an API that works with any SSR solution.

## Installation

React InstantSearch Hooks Server is available on the npm registry.

```sh
yarn add react-instantsearch-hooks-server
# or
npm install react-instantsearch-hooks-server
```

## Getting started

React InstantSearch Hooks is compatible with server-side rendering. The library provides an API that works with any SSR solution. You can, for example, use it with an [express](https://expressjs.com/) server or with [Next.js](https://nextjs.org/).

Check out our [**Server-side rendering guide**](https://algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react-hooks/) to start rendering your React InstantSearch Hooks app on the server.

## API reference

- [`getServerState()`](https://algolia.com/doc/api-reference/widgets/server-state/react-hooks/)
- [`<InstantSearchSSRProvider>`](https://algolia.com/doc/api-reference/widgets/ssr-provider/react-hooks/)

## Documentation

The full documentation is available on [algolia.com/doc](https://algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react-hooks/).

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

React InstantSearch Hooks is [MIT licensed](../../LICENSE).

<!-- Links -->

[contributing-bugreport]: https://github.com/algolia/instantsearch.js/issues/new?template=BUG_REPORT.yml&labels=triage,Library%3A%20React+InstantSearch+Hooks
[contributing-featurerequest]: https://github.com/algolia/instantsearch.js/discussions/new?category=ideas&labels=triage,Library%3A%20React+InstantSearch+Hooks&title=Feature%20request%3A%20
[contributing-newissue]: https://github.com/algolia/instantsearch.js/issues/new?labels=triage,Library%3A%20React+InstantSearch+Hooks
[contributing-label-easy]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A+Easy%22+label%3A%22Library%3A%20React+InstantSearch+Hooks%22
[contributing-label-bug]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Bug%22+label%3A%22Library%3A%20React+InstantSearch+Hooks%22
[contributing-label-chore]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Chore%22+label%3A%22Library%3A%20React+InstantSearch+Hooks%22
