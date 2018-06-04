[![React InstantSearch logo][logo]][website]

### Requirements

To run this project, you will need:

- Node.js >= v8.10.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)
- Yarn >= v1.5.1 - [install instructions](https://yarnpkg.com/en/docs/install#alternatives-stable)

## Development

We use the [documentation website][website] as the main way to develop React InstantSearch.

```sh
yarn
yarn start
```

Go to <http://localhost:3000> for the documentation website.
Go to <http://localhost:6006> for Storybook.

The applications won't reload on code change. To enable the watch mode, run the following command in another tab.

```sh
yarn watch
```

## Code

The code for React InstantSearch is located in [packages](packages).

## Test

We have unit tests written with [Jest](https://facebook.github.io/jest):

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
yarn release
```

### Beta release

```sh
yarn release --beta
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

This uses [netlify](https://www.netlify.com).

[logo]: ./docgen/readme-logo.png
[website]: https://community.algolia.com/react-instantsearch
