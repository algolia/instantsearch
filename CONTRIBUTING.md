[![React InstantSearch logo][logo]][website]

## Development

We use the [documentation website][website] as the main way to develop
React InstantSearch.

```sh
yarn boot
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
npm run release -- -b # or --beta
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

## Upgrade deps

```sh
yarn upgrade-deps
```

## See next release changelog

```sh
yarn changelog
```

[logo]: ./docgen/readme-logo.png
[website]: https://community.algolia.com/react-instantsearch/
