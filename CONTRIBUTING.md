<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Development](#development)
- [Code](#code)
- [Test](#test)
- [Lint](#lint)
- [Release](#release)
- [Update docs](#update-docs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

[![InstantSearch.js logo][logo]][website]

## Development

```sh
yarn
yarn dev:docs
```

Go to <http://localhost:8080> for the example playground.

Go to <http://localhost:4000> for the documentation website.

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

## Lint

```sh
yarn lint
```

Files are automatically formatted with prettier.

## Release

```sh
npm run release
```

## Update docs

Documentation website is automatically updated by Travis when master is merged.

[logo]: ./docs/readme-logo.png
[website]: https://community.algolia.com/instantsearch.js
