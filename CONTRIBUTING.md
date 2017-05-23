# Contributing

First of all, thanks for contributing! You can check out the issues tagged with "difficulty: easy ❄️" for a start.

## Getting started

To get started you should:

```sh
# Install dependencies common to the packages
yarn install

# Build CommonJS, ES module and UMD
yarn build

# Launch tests with Jest and also run the linter
# Most of the tests rely on the CommonJS build
# Because we need rollup to load .vue files
# Consider using `yarn watch` when developing.
yarn test

# Watch for changes and run tests with Jest
# Also runs the linter
yarn watch
```
