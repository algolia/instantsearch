<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Development](#development)
- [Code](#code)
- [Test](#test)
- [Lint](#lint)
- [Release](#release)
- [Update docs](#update-docs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

[![InstantSearch.js logo][logo]][website]

A note about the branches used in this project:
 - `develop` is for the major version in active development (currently v2)
 - `maintenance` is for the previous major version (currently v1)
 - `master` is for the main current stable version

You should do the dev and PR according to the target version. No new features
will be done on the maintenance version.

## Development

```sh
yarn
yarn dev:docs
```

Go to <http://localhost:8080> for the example playground.

Go to <http://localhost:4000> for the documentation website.

## Code

The code for InstantSearch.js is located in [src](src).

## Test

We have unit tests written with [Jest](https://facebook.github.io/jest/):

Single run and linting:
```sh
yarn test
```

Watch mode:
```sh
yarn test:watch # unit tests watch mode, no lint
```

## Lint

```sh
yarn lint
```

Files are automatically formatted with prettier.

## Release

```sh
npm run release
```

## Update docs

Documentation website is automatically updated by Travis when master is merged.

[logo]: ./docs/readme-logo.png
[website]: https://community.algolia.com/instantsearch.js
