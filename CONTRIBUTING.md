# Contributing

First of all, thanks for contributing! You can check out the issues tagged with "difficulty: easy ❄️" for a start.

## Getting started

This project uses [Lerna](https://github.com/lerna/lerna) to orchestrate all the packages.

To get started you should:

```sh
# Install dependencies common to the packages
npm install

# Download all dependencies and build all packages
npm run boot

# Build the dependencies of all packages
npm run build

# Clean all the dependencies and build again
npm run reboot

# Launch tests with Jest
npm test
```
