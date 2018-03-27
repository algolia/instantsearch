[![React InstantSearch logo][logo]][website]

### Requirements

To run this project, you will need:

- Node.js >= v7.10.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)
- Yarn >= v0.23.4 - [install instructions](https://yarnpkg.com/en/docs/install#alternatives-tab)

## Development

We use the [documentation website][website] as the main way to develop
React InstantSearch.

```sh
yarn bootstrap
yarn start
```

Go to <http://localhost:3000>.

## Code

The code for React InstantSearch is located in [packages/react-instantsearch](packages/react-instantsearch).

## Test

We have unit tests written with [Jest](https://facebook.github.io/jest/):

Single run and linting:
```sh
yarn test
```

Watch mode:
```sh
yarn dev # unit tests watch mode, no lint
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

### Beta release

```sh
npm run release -- --beta
```

Append `-beta.x` where x is a number to the version for beta, so 4.0.0-beta.2 for example.

## Update docs

```sh
yarn docs:deploy-production
```

## Deploy a preview of docs

```sh
yarn docs:deploy-preview
```

This uses [netlify](https://www.netlify.com/).

## See next release changelog

```sh
yarn changelog
```

[logo]: ./docgen/readme-logo.png
[website]: https://community.algolia.com/react-instantsearch/
