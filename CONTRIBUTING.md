<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

  - [Requirements](#requirements)
- [Development](#development)
- [Code](#code)
- [Test](#test)
- [Functional tests](#functional-tests)
  - [Local setup](#local-setup)
  - [Local run](#local-run)
  - [Debugging](#debugging)
- [Lint](#lint)
- [Release](#release)
  - [Main version](#main-version)
  - [Maintenance version](#maintenance-version)
- [Update docs](#update-docs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

[![InstantSearch.js logo][logo]][website]

A note about the branches used in this project:
 - `develop` is for the major version in active development (currently v2)
 - `maintenance` is for the previous major version (currently v1)
 - `master` is for the main current stable version

You should do the dev and PR according to the target version. No new features
will be done on the maintenance version.

Once you make a pull request, a bot will comment with a link to a development version of the website. On it you can find

1. The generated documentation 
    - for example: https://deploy-preview-2383--algolia-instantsearch.netlify.com/
    - source: https://github.com/algolia/instantsearch.js/tree/develop/docgen
2. A playground for the widgets
    - for example: https://deploy-preview-2383--algolia-instantsearch.netlify.com/dev-novel/
    - source: https://github.com/algolia/instantsearch.js/tree/develop/dev

### Requirements

To run this project, you will need:

- Node.js >= v7.10.0 and <= 8, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)
- yarn https://yarnpkg.com/en/

## Development

```sh
yarn
yarn dev:docs
```

Go to <http://localhost:8080> for the example playground.

Go to <http://localhost:3000> for the documentation website.

## Code

The code for InstantSearch.js is located in [src](src).

## Test

We have unit tests written with [Jest](https://facebook.github.io/jest/):

Single run and linting:
```sh
yarn test
```

Watch mode:
```sh
yarn test:watch # unit tests watch mode, no lint
```

## Functional tests

We have one functional test ensuring that when we instantiate a full app with
a `searchBox`, we are able to use it and get different hits than initially.

Functional tests are built with [webdriver.io](http://webdriver.io/), a wrapper
around [WebDriver API](https://www.w3.org/TR/2013/WD-webdriver-20130117/) (Selenium).
On travis they will run on different browsers using [Sauce Labs](https://saucelabs.com/).

### Local setup

Locally it will use a docker image bundling Selenium and browsers.

```sh
docker pull elgalu/selenium
# this helps in loading the host website from the container,
# comes from https://docs.docker.com/docker-for-mac/networking/#known-limitations-use-cases-and-workarounds
docker run -d --name=grid -p 4444:24444 -p 6080:26080 -p 5900:25900 \
    -e TZ="US/Pacific" -e NOVNC=true -v /dev/shm:/dev/shm --privileged elgalu/selenium
```

### Local run

```sh
# We want to access the host machine from the container (to reach the test app web server).
# Needed once per session, this is not persistent:
sudo ifconfig lo0 alias 10.200.10.1/24
npm run test:functional
# npm run test:functional:dev will reload tests when file changes
# npm run test:functional:dev:debug will load the test website locally for you to open it
# if something goes wrong: docker restart grid && killall node
```

Locally you can inspect (view) the browser doing the test here: http://localhost:6080/.

### Debugging

In order to check the status of the functional tests on all the platforms we use
sauce labs. The first here is to [get the credentials](https://saucelabs.com/beta/user-settings) of your sauce labs account.

Running the functional tests on sauce labs:

```sh
SAUCE_USERNAME=[your login] SAUCE_ACCESS_KEY=[your api key] CI=true yarn run test:functional
```

You can then inspect the status of tests from your dashboard. Check the browsers for which tests are
failing. If some are IE or Edge you can download a virtual machine image from the
[Microsoft website](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/).

Update the config of the dev server (instantsearch.js/scripts/dev.sh) so that you can access
the test page with your VM. **Do not commit this change**

```diff
- webpack-dev-server --config dev/webpack.dev.config.babel.js --hot --inline --no-info &
+ webpack-dev-server --config dev/webpack.dev.config.babel.js --hot --inline --no-info --public [your_ip] &
```

Then you should be able bebug using the dev setup: `yarn run dev` and the virtual machine. You can also
run the page used for function tests using `yarn run test:functional:dev:debug`

## Lint

```sh
yarn lint
```

Files are automatically formatted with prettier.

## Release

### Main version
For the main version, go on master (`git checkout master`) and use:

```sh
npm run release
```

**Be sure to use `$ npm run` instead of `$ yarn run` to avoid issues**

### Maintenance version

For the maintenance version, go on maintenance (`git checkout maintenance`) and use:

```sh
npm run release-maintenance
```

**Be sure to use `$ npm run` instead of `$ yarn run` to avoid issues**

## Update docs

Documentation website is automatically updated by Travis when master is merged.

[logo]: https://community.algolia.com/instantsearch.js/v2/assets/img/InstantSearch-JavaScript.svg
[website]: https://community.algolia.com/instantsearch.js
