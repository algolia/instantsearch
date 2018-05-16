<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

  - [Requirements](#requirements)
- [Development](#development)
- [Code](#code)
- [Test](#test)
- [Lint](#lint)
- [Release](#release)
  - [Main version](#main-version)
  - [Maintenance version](#maintenance-version)
- [Manually update v1/ docs](#manually-update-v1-docs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

[![InstantSearch.js logo][logo]][website]

A note about the branches used in this project:
 - `develop` is for the major version in active development (currently v2)
 - `maintenance` is for the previous major version (currently v1)
 - `master` is for the main current stable version

You should do the dev and PR according to the target version. No new features
will be done on the maintenance version.

### Requirements

To run this project, you will need:

- Node.js 8.6.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)

## Development

```sh
npm install
npm run dev:docs
```

Go to <http://localhost:8080> for the example playground.

Go to <http://localhost:4000> for the documentation website.

## Code

The code for InstantSearch.js is located in [src](src).

## Test

We have unit tests written with [Jest](https://facebook.github.io/jest/):

Single run and linting:
```sh
npm test
```

Watch mode:
```sh
npm run test:watch # unit tests watch mode, no lint
```

## Lint

```sh
npm run lint
```

Files are automatically formatted with prettier.

## Release

### Main version
For the main version, go on master (`git checkout master`) and use:

```sh
npm run release
```

### Maintenance version

For the maintenance version, go on maintenance (`git checkout maintenance`) and use:

```sh
npm run release-maintenance
```

## Manually update v1/ docs

Generate a personal token from GitHub then

```sh
GH_TOKEN=... npm run docs:update-website
```

[logo]: ./docs/readme-logo.png
[website]: https://community.algolia.com/instantsearch.js
