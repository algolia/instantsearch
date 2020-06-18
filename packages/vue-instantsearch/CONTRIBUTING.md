# Contributing

First of all, thanks for contributing! You can check out the issues tagged with "difficulty: easy ❄️" for a start.

## Get ready for contributions

You'll first need to install the dependencies:

```sh
yarn install
```

Then we recommend that you run:

```sh
yarn test:watch
```

This will watch the files for changes and build the CommonJS bundle that is required by the tests.
It will the run the test on that newly generated build.

## Commit format

The project uses [conventional commit format](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md) to automate the updates of the CHANGELOG.md.

## Releasing the library

To release the library, the first step is to create a "release PR" by running:

```bash
yarn release
```

For that script to work, you need to provide `GITHUB_TOKEN` environment variable. You can either prepend it or put it in `.env` file.

```bash
GITHUB_TOKEN=xyz yarn release

or

echo "GITHUB_TOKEN=xyz" >> .env
yarn release
```

You can create a token at [GitHub](https://github.com/settings/tokens/new) with `Full control of private repositories` scope.

This will ask you the new version of the library, and update all the required files accordingly.
At the end of the process, the release branch is pushed to GitHub and a Pull Request is automatically created.

Once the changes are approved you can merge it there. Then CircleCI will be triggered and it will run

```bash
yarn shipjs trigger
```

This will:

- publish the new version on NPM
- tag and push the tag to GitHub

## Documentation

You can either directly click on "EDIT ON GITHUB" links on the live documentation: https://community.algolia.com/vue-instantsearch/.

Or you can run the documentation locally:

```sh
$ npm run docs:watch
```

### Deploying documentation

The documentation is automatically deployed on temporary URLs by [netlify](https://www.netlify.com/) on pull requests.

To release the documentation to the community website, you can run:

```bash
yarn run docs:deploy
```
