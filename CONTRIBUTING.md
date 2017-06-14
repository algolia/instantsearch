# Contributing

First of all, thanks for contributing! You can check out the issues tagged with "difficulty: easy ❄️" for a start.

## Get ready for contributions

You'll first need to install the dependencies:

```sh
yarn install
```

Then we recommend that you run:

```sh
yarn watch
```

This will watch the files for changes and build the CommonJS bundle that is required by the tests.
It will the run the test on that newly generated build.

## Documentation

You can either directly click on "EDIT ON GITHUB" links on the live documentation: http://vue-instantsearch.netlify.com/.

Or you can run the documentation locally:

```sh
npm run docs:watch
```

### Deploying documentation

The documentation is automatically deployed by [netlify](https://www.netlify.com/) when
code is merged on the master branch.
