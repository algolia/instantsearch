Algolia components for Vue.js
-----------------------------

This project uses [Lerna](https://github.com/lerna/lerna) to orchestrate the all the packages.

To get started you should:

```sh
# Install Lerna globally
yarn global add lerna

# Install dependencies common to the packages
yarn install

# Download all dependencies
lerna bootstrap

# Build all the packages
lerna run build
```

## Lerna caveats (probably because of Yarn)

Sometimes your builds will fail because of incorrect dependencies resolution. If that happens, the easiest fix is
to delete all `node_modules` folders and to bootstrap again.

```sh
rm -rf ./packages/*/node_modules
lerna bootstrap
```

