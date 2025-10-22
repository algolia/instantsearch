# Contribution Guide

## Test

```bash
npm test
# or
yarn test
```

## Build

```bash
npm run build
# or
yarn build
```

## Run example

```bash
npm start
# or
yarn start
```

## Release

```bash
npm run release
# or
yarn release
```

### First Release

```bash
npm run release -- --first-release
# or
yarn release --first-release
```

This will tag a release without bumping the version.

When you are ready, push the git tag and run `npm publish`.

If you want to publish it as a public scoped package, run `npm publish --access public` the first time.

[To know more about `standard-version`, read this →](https://github.com/conventional-changelog/standard-version#cli-usage)
