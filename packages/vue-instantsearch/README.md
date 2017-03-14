Algolia components for Vue.js
-----------------------------

This project uses [Lerna](https://github.com/lerna/lerna) to orchestrate all the packages.

To get started you should:

```sh
# Install Lerna globally
yarn global add lerna

# Install dependencies common to the packages
yarn install

# Download all dependencies and build all packages
yarn boot

# Or with native lerna: 
lerna bootstrap --npmClient=yarn

# if you want to run the building later again
lerna run build
```

Note: `yarn boot` will delete all node modules and make sure all npm dependencies are properly rebuilt.