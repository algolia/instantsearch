# Contributing

First of all, thanks for contributing! You can check out the issues tagged with "difficulty: easy ❄️" for a start.

## Getting started

This project uses [Lerna](https://github.com/lerna/lerna) to orchestrate all the packages.

To get started you should:

```sh
# Install dependencies common to the packages
yarn install

# Download all dependencies and build all packages
yarn boot

# Build the dependencies of all packages
yarn build

# Clean all the dependencies and build again
yarn reboot

# Launch tests with Jest and also run the linter
yarn test

# Watch for changes and run tests with Jest
yarn watch
```
