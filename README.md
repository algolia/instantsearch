[![React InstantSearch logo][readme-logo]][website-url]

**Looking for instantsearch.js instead? Go to the [`develop`][instantsearch.js-v1-github-url] branch.**

React InstantSearch is a set of [widgets][widgets-url] and [connectors][connectors-url] to add instant-search
experiences in your [React][react-url] application, using [Algolia search engine][algolia-url].

Documentation: <https://community.algolia.com/instantsearch.js/react/>.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Project structure](#project-structure)
- [Development](#development)
- [Test](#test)
- [Lint](#lint)
- [Release](#release)
- [Update docs](#update-docs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Development

We use the [documentation website][website-url] as the main way to develop React InstantSearch.

```sh
yarn
npm start
```

Go to <http://localhost:3000>.

## Test

We have unit tests for all `packages/`:

```sh
npm test # one shot run, also lint and tries to build the documentation
```

```sh
npm run dev # unit tests watch mode, no lint
```

## Lint

```sh
npm run lint # only changed files in dev, all files in CI
npm run lint:fix
```

## Release

```sh
npm run release
```

## Update docs

```sh
npm run docs:update
```

## What about instantsearch.js?

[instantsearch.js][instantsearch.js-v1-github-url] is our first instant-search related project. We still support the current version (v1.x.x) of it. And you can still count on contributors to fix bugs.

In the near future this current repository will hold any instant-search related project:
- instantsearch-core
- instantsearch.js v2 (based on react-instantsearch)
- instantsearch-vue
- …

While we are in transition mode, the `v2` branch is the main development branch for any of the upcoming projects.

The `develop` branch will soon be renamed `v1` and `v2` will be the new develop as soon as we have instantsearch.js v2.

[readme-logo]: ./docgen/readme-logo.png
[website-url]: https://community.algolia.com/instantsearch.js/react/
[algolia-url]: https://www.algolia.com/
[react-url]: https://facebook.github.io/react/
[widgets-url]: https://community.algolia.com/instantsearch.js/react/widgets/
[connectors-url]: https://community.algolia.com/instantsearch.js/react/widgets/connectors/
[instantsearch.js-v1-github-url]: https://github.com/algolia/instantsearch.js/tree/develop
