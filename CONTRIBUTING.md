<p align="center">
  <a href="https://community.algolia.com/instantsearch.js">
    <img alt="InstantSearch.js" src="https://community.algolia.com/instantsearch.js/v2/assets/img/instantsearch-medal.svg" width="250">
  </a>
</p>

Hello and welcome to the contributing guide guide for InstantSearch.js. Thanks for considering
participating in our project 🙇

If this guide does not contain what you are looking for and thus prevents you from contributing,
don't hesitate to leave a message on the [community forum](https://discourse.algolia.com/) or
[open an issue](https://github.com/algolia/instantsearch.js/issues).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Contributing with a new issue](#contributing-with-a-new-issue)
- [The code contribution process](#the-code-contribution-process)
- [Commit conventions](#commit-conventions)
- [Branches organization](#branches-organization)
- [Requirements](#requirements)
- [Launch the dev environment](#launch-the-dev-environment)
- [Updating the examples](#updating-the-examples)
- [Folders of the project](#folders-of-the-project)
  - [The source folder](#the-source-folder)
  - [The documentation source](#the-documentation-source)
  - [The storybook source](#the-storybook-source)
- [Tests](#tests)
  - [Unit tests](#unit-tests)
  - [Functional tests](#functional-tests)
- [Linting](#linting)
- [Release](#release)
  - [Main version](#main-version)
  - [Maintenance version](#maintenance-version)
- [Updating the docs](#updating-the-docs)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Contributing with a new issue

Opening an issue is very useful for us so don't hesitate, we'll make sure to fix it
as soon as possible if it's technically feasible and doesn't have important side effects
for the other users.

Before opening an issue, first check that there is not an already open issue for the same
topic using the [issues tab](https://github.com/algolia/instantsearch.js/issues). Don't
hesitate to thumb up an issue that corresponds to the problem you found.

Another element that will help us go faster at solving the issue is to provide a reproducible
test case. We often recommend to [use this CodeSandbox template](https://codesandbox.io/s/github/algolia/instantsearch-templates/tree/master/src/InstantSearch.js).

## The code contribution process

On your side:
 - Fork and clone the project
 - Create a new branch for what you want to solve (fix/*issue number*, feat/2.x-*name of the feature*)
 - Make your changes
 - Open a pull request

Depending on what you're working, you might consider different base branches.

Then:
 - Peer review of the pull request (by at least one of the core contributors)
 - Automatic checks ([tests](#tests-), [commits](#commit-conventions-), [linters](#lint-))
 - When everything is green, your contribution is merged 🚀

After you create a pull request, a bot will comment with a link to a development version of the website.

On it you can find a playground for the widgets: https://**deploy-url-netlify**/stories

- for example: https://deploy-preview-3376--instantsearchjs.netlify.com/stories/
- source: https://github.com/algolia/instantsearch.js/tree/develop/storybook

## Commit conventions

This project follows the [conventional changelog](https://conventionalcommits.org/) approach.
This means that all commit messages should be formatted using the following scheme:

```
type(scope): description
```

In most cases, we use the following types:
 - `fix`: for anything that contains the resolution of an issue (identified or not)
 - `feat`: for anything that contains a new feature
 - `chore`: for anything that is not related to the library itself (doc, tooling)

Even though the scope is optional, we try to fill it in as it helps us better understand the
impact of a change. We either use the name of the widget / connector / component impacted or we
use the kind of part of the project it will impact, for example: `docs`, `tooling`, `ci`

Finally if your work is based on an issue on GitHub, please add in the body of the commit message
`fix #1234` if it solves the issue #1234.

Some examples of valid commit messages (first line):
 - fix(searchbox): make magnifying glass bigger
 - chore(deps): update dependency style-loader to v0.19.0
 - fix(connectRefinementList): set default value for limit
 - chore: reword contributions guides

## Branches organization

The project is based on the classic GitHub flow because we are building a library and
each version must be crafted with care. We also maintain a branch specific for the older
version of the library (currently v1). Finally, when building feature (that will go in the
next minor version) we have specific branch.

To sum up, we have:
 - `develop` for the version -- Pull requests for bugs should be created against this branch
 - `feat/2.*` for the next minor version -- Pull requests for features should be created against this branch
 - `master` for the current stable version -- we usually don't make pull requests for this branch
 - `maintenance` for the previous major version (currently v1) -- Pull requests for critical bug fixes on the old version

You should do the dev and create pull requests according to the target version.

NB: No new features will be done on the maintenance version.

## Requirements

To run this project, you will need:

 - Node.js >= 8 (current stable version) -- using nvm makes the life easier - [install instructions](https://github.com/creationix/nvm#install-script)
 - Yarn https://yarnpkg.com/en/

## Launch the dev environment

During the development, we use two main tools. The dev app / playground in which we create stories
for the different widgets and the documentation website which has create API documentation based
on the JSDoc comments.

```sh
yarn
yarn dev
```

Go to <http://localhost:8080> for the example playground.

Go to <http://localhost:3000> for the documentation website.

## Updating the examples

To update the documentation examples, you must re-build the InstantSearch.js library each time
you change it via:

```sh
yarn build
```

And also relaunch the dev environement afterwards.

## Folders of the project

Here are the main files and folders of the project.

```
▸ functional-tests/   << the functional tests
▸ scripts/            << the scripts for maintaining the project
▸ src/                << the source of the library
▸ storybook/          << the storybook source
▸ website/            << the website source
  CHANGELOG.md        << the autogenerated changelog (based on commits)
  CONTRIBUTING.md     << this file
  package.json        << the definition of the project
  README.md           << the introduction of the project
```

### The source folder

```
▸ src/
  ▸ components/       << The pReact components for the UI of our widgets (UI)
  ▸ connectors/       << The source of all the connectors (UX without UI)
  ▸ css/              << The source of the themes (reset / algolia theme)
  ▸ lib/              << The core of the library, instantsearch, url
  ▸ widgets/          << The source of the widgets (UX + UI)
  ▸ helpers/          << The source of the method helpers
```

### The storybook source

```
▾ storybook/
  ▾ app/                      << the source of the dev app
    ▸ builtin/                << templates used for built-in widgets
    ▸ utils/                  << utility functions to build stories
      index.js                << main script of the dev app
      init-unmount-widgets.js << initialization of the IS.js app with unmountable widgets
    style.css
    template.html
    webpack.config.js
```

## Tests

### Unit tests
Our unit tests are written with [Jest](https://facebook.github.io/jest/):

To run all the tests once:
```sh
yarn test
```

To run the test continuously based on what you changed (useful when developing or debugging):
```sh
yarn test:watch # unit tests watch mode, no lint
```

### Functional tests

We have one functional test ensuring that when we instantiate a full app with
a `searchBox`, we are able to use it and get different hits than initially.

Functional tests are built with [webdriver.io](http://webdriver.io/), a wrapper
around [WebDriver API](https://www.w3.org/TR/2013/WD-webdriver-20130117/) (Selenium).
On travis they will run on different browsers using [Sauce Labs](https://saucelabs.com/).

#### Local setup

Locally it will use a docker image bundling Selenium and browsers.

```sh
docker pull elgalu/selenium
# this helps in loading the host website from the container,
# comes from https://docs.docker.com/docker-for-mac/networking/#known-limitations-use-cases-and-workarounds
docker run -d --name=grid -p 4444:24444 -p 6080:26080 -p 5900:25900 \
    -e TZ="US/Pacific" -e NOVNC=true -v /dev/shm:/dev/shm --privileged elgalu/selenium
```

#### Running locally

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

#### Debugging

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
- webpack-dev-server --config storybook/webpack.dev.config.babel.js --hot --inline --no-info &
+ webpack-dev-server --config storybook/webpack.dev.config.babel.js --hot --inline --no-info --public [your_ip] &
```

Then you should be able debug using the dev setup: `yarn run dev` and the virtual machine. You can also
run the page used for function tests using `yarn run test:functional:dev:debug-server`

## Linting

Linters are static checkers for the code. They help us maintain a consistent code base. They are used
for js and SCSS files.

If your editor support them, then you will see the errors directly there. You can also run them using
your command line:

```sh
yarn lint
```

The JS files are validated using a combination of prettier (strict syntax form) and eslint rules (for
common mistakes and patterns).

## Release

### Main version
For the main version, go on develop (`git checkout develop`) and use:

```sh
npm run release
```

**Be sure to use `$ npm run` instead of `$ yarn run` to avoid issues**

### Maintenance version

For the maintenance version, go on maintenance (`git checkout maintenance`) and use:

```sh
npm run release:maintenance
```

**Be sure to use `$ npm run` instead of `$ yarn run` to avoid issues**

#### Beta version

Beta version release is available on any branch except `master`, `maintenance`. The
main use cases are for releasing a patch before the official release, or create custom builds
with new features (or friday releases).

If you're on a feature branch (either for a fix or a new minor/major version), you can run:

```sh
npm run release
```

You can also release a beta version from `develop`, using the beta flag in the command line:

```sh
npm run release -- --beta
```

**Be sure to use `$ npm run` instead of `$ yarn run` to avoid issues**

## Updating the docs

The documentation website is created and pushed during the release of main version.

<!-- Links -->

[website]: https://community.algolia.com/instantsearch.js
