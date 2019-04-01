<p align="center">
  <a href="https://community.algolia.com/instantsearch.js">
    <img alt="InstantSearch.js" src="https://community.algolia.com/instantsearch.js/v2/assets/img/instantsearch-medal.svg" width="250">
  </a>
</p>

Hello and welcome to the contributing guide guide for InstantSearch.js. Thanks for considering participating in our project 🙇

If this guide does not contain what you are looking for and thus prevents you from contributing, don't hesitate to leave a message on the [community forum](https://discourse.algolia.com/) or [open an issue](https://github.com/algolia/instantsearch.js/issues).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Contributing with a new issue](#contributing-with-a-new-issue)
- [The code contribution process](#the-code-contribution-process)
- [Commit conventions](#commit-conventions)
- [Branches organization](#branches-organization)
- [Requirements](#requirements)
- [Launch the dev environment](#launch-the-dev-environment)
- [Folders of the project](#folders-of-the-project)
  - [The source folder](#the-source-folder)
- [Tests](#tests)
  - [Unit tests](#unit-tests)
- [Linting](#linting)
- [Release](#release)
  - [Main version](#main-version)
  - [Maintenance version](#maintenance-version)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Contributing with a new issue

Opening an issue is very useful for us so don't hesitate, we'll make sure to fix it as soon as possible if it's technically feasible and doesn't have important side effects for the other users.

Before opening an issue, first check that there is not an already open issue for the same topic using the [issues tab](https://github.com/algolia/instantsearch.js/issues). Don't hesitate to thumb up an issue that corresponds to the problem you found.

Another element that will help us go faster at solving the issue is to provide a reproducible test case. We often recommend to [use this CodeSandbox template](https://codesandbox.io/s/github/algolia/instantsearch-templates/tree/master/src/InstantSearch.js).

## The code contribution process

On your side:

- Fork and clone the project
- Create a new branch for what you want to solve (fix/_issue number_, feat/2.x-_name of the feature_)
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
- source: https://github.com/algolia/instantsearch.js/tree/develop/stories

## Commit conventions

This project follows the [conventional changelog](https://conventionalcommits.org/) approach. This means that all commit messages should be formatted using the following scheme:

```
type(scope): description
```

In most cases, we use the following types:

- `fix`: for anything that contains the resolution of an issue (identified or not)
- `feat`: for anything that contains a new feature
- `chore`: for anything that is not related to the library itself (doc, tooling)

Even though the scope is optional, we try to fill it in as it helps us better understand the impact of a change. We either use the name of the widget / connector / component impacted or we use the kind of part of the project it will impact, for example: `docs`, `tooling`, `ci`

Finally if your work is based on an issue on GitHub, please add in the body of the commit message `fix #1234` if it solves the issue #1234.

Some examples of valid commit messages (first line):

- fix(searchbox): make magnifying glass bigger
- chore(deps): update dependency rollup-plugin-babel to v3.0.7
- fix(connectRefinementList): set default value for limit
- chore: reword contributions guides

## Branches organization

The project is based on the classic GitHub flow because we are building a library and each version must be crafted with care. We also maintain a branch specific for the older version of the library (currently v1). Finally, when building feature (that will go in the next minor version) we have specific branch.

To sum up, we have:

- `develop` for the version -- Pull requests for bugs should be created against this branch
- `feat/2.*` for the next minor version -- Pull requests for features should be created against this branch
- `master` for the current stable version -- we usually don't make pull requests for this branch
- `maintenance` for the previous major version (currently v1) -- Pull requests for critical bug fixes on the old version

You should do the dev and create pull requests according to the target version.

_Note that no new features will be developed on the maintenance version._

## Requirements

To run this project, you will need:

- Node.js ≥ 8 (current stable version) – [nvm](https://github.com/creationix/nvm#install-script) is recommended
- [Yarn](https://yarnpkg.com)

## Launch the dev environment

We use [Storybook](https://github.com/storybooks/storybook) to create stories for widgets.

```sh
yarn
yarn dev
```

Go to <http://localhost:6006> for the widget playground.

## Folders of the project

Here are the main files and folders of the project.

```
▸ .storybook/         << the storybook configuration source
▸ scripts/            << the scripts for maintaining the project
▸ src/                << the source of the library
▸ stories/            << the widget stories
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

## Tests

### Unit tests

Our unit tests are written with [Jest](https://facebook.github.io/jest/):

To run all the tests once:

```sh
yarn test
```

To run the test continuously based on what you changed (useful when developing or debugging):

```sh
yarn test --watch
```

## Linting

Linters are static checkers for code. They help us maintain a consistent code base. They are used for JavaScript files.

If your editor support them, then you will see the errors directly there. You can also run them using your command line:

```sh
yarn lint
```

JavaScript files are validated using a combination of [Prettier](https://github.com/prettier/prettier) (strict syntax form) and [ESLint](https://github.com/eslint/eslint) rules (for common mistakes and patterns).

## Release

### Main version

For the main version, go on develop (`git checkout develop`) and use:

```sh
npm run release
```

_Make sure to use `npm run` instead of `yarn run` to avoid issues._

### Maintenance version

For the maintenance version, go on maintenance (`git checkout maintenance`) and use:

```sh
npm run release:maintenance
```

_Make sure to use `npm run` instead of `yarn run` to avoid issues._

#### Beta version

Beta version release is available on any branch except `master`, `maintenance`. The main use cases are for releasing a patch before the official release, or create custom builds with new features (or friday releases).

If you're on a feature branch (either for a fix or a new minor/major version), you can run:

```sh
npm run release
```

You can also release a beta version from `develop`, using the beta flag in the command line:

```sh
npm run release -- --beta
```

_Make sure to use `npm run` instead of `yarn run` to avoid issues._
