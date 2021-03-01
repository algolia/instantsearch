<p align="center">
  <a href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/">
    <img alt="React InstantSearch" src=".github/react-instantsearch-banner.png">
  </a>
</p>

### Requirements

To run this project, you will need:

- Node.js >= v8.10.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)
- Yarn >= v1.16.0 - [install instructions](https://yarnpkg.com/en/docs/install#alternatives-stable)

## Development

We use the [Storybook](https://storybook.js.org/) as the main way to develop React InstantSearch.

```sh
yarn
yarn start
```

Go to <http://localhost:6006>.

The applications won't reload on code change. To enable the watch mode, run the following command in another tab.

```sh
yarn watch
```

## Code

The code for React InstantSearch is located in [packages](packages).

## Test

We have unit tests written with [Jest](https://facebook.github.io/jest):

Single run:

```sh
yarn test
```

Watch mode:

```sh
yarn test:watch
```

## Lint

```sh
yarn lint
```

Files are automatically formatted with Prettier.

## Release

You need to have `GITHUB_TOKEN` added to your `.env` file. You can create a [personal access token](https://github.com/settings/tokens).

```sh
yarn release
```

It will create a pull request for the next release. When it's reviewed, approved and merged, then CircleCI will automatically publish it to npm.

### Beta release

```sh
yarn release
```

The script will ask you a question about the next version. If it's wrong, you can say "No" and specify the version (e.g. "7.0.0-beta.0"). Then, it will open a pull request for that release. When the pull request is merged, CircleCI will publish it to npm with a `--tag beta` argument.

## Update docs

```sh
yarn docs:deploy-production
```

## Deploy a preview of docs

```sh
yarn docs:deploy-preview
```

This uses [netlify](https://www.netlify.com).
