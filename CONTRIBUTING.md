[![React InstantSearch logo][readme-logo]][react-doc]

First of all, thanks for wanting to help out with InstantSearch :tada:!

Here's some information you can use to contribute to InstantSearch

Currently we support [React](https://facebook.github.io/react/)
and plain JavaScript (or Vanilla) via:
- ⚛ React and React Native ➡️ [React InstantSearch][react-doc]
- 🍦 Vanilla ➡️ [InstantSearch.js][vanilla-doc]

## Development

We use the [documentation website][react-doc] as the main way to develop
React InstantSearch.

```sh
yarn boot
yarn start
```

Go to <http://localhost:3000>.

## Test

We have unit tests for all `packages/`:

```sh
yarn test # one shot run, also lint and tries to build the documentation
```

```sh
yarn dev # unit tests watch mode, no lint
```

## Lint

```sh
yarn lint # only changed files in dev, all files in CI
yarn lint:fix
```

## Release

```sh
npm run release
```

This cannot yet be moved to `yarn release` so please use `npm run release`.

To publish a beta version, you have to use:

```sh
npm run release -- -b # or --beta
```

Then for the version you bump if needed, and append `-beta.0` (or 1 etc for next versions).

The beta website will be updated automatically.

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

[readme-logo]: ./docgen/readme-logo.png
[react-doc]: https://community.algolia.com/instantsearch.js/react/
[vanilla-doc]: https://community.algolia.com/instantsearch.js/
[algolia-url]: https://www.algolia.com/
[react-url]: https://facebook.github.io/react/
[widgets-url]: https://community.algolia.com/instantsearch.js/react/widgets/
[connectors-url]: https://community.algolia.com/instantsearch.js/react/widgets/connectors/
[instantsearch.js-v1-github-url]: https://github.com/algolia/instantsearch.js/tree/develop
