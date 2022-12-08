# Contributing to Create InstantSearch App

Thank you for wanting to get involved in Create InstantSearch App! The goal of the package is to enable users to create InstantSearch applications quickly.

<details>
  <summary><strong>Contents</strong></summary>


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Core concepts](#core-concepts)
  - [Folder structure](#folder-structure)
  - [Adding a template](#adding-a-template)
- [Requirements](#requirements)
- [Conventions](#conventions)
  - [Commits](#commits)
- [Workflow](#workflow)
  - [Filing issues](#filing-issues)
  - [Contributing to the code](#contributing-to-the-code)
  - [Releasing](#releasing)
  - [Updating templates on CodeSandbox](#updating-templates-on-codesandbox)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

</details>

## Core concepts

The `create-instantsearch-app` CLI is based on the module `createInstantSearchApp(path, options?, tasks?)`.

### Folder structure

```
▸ src
  ▸ api               The source code of the module `createInstantSearchApp()`
  ▸ cli               The source code of the CLI `create-instantsearch-app`
  ▸ tasks             The tasks of the app generation lifecycle
  ▸ templates         The official templates supported
  ▸ utils             The utility functions for the package
▸ scripts             The end-to-end tests and release scripts
  CHANGELOG.md
  CONTRIBUTING.md
  LICENSE
  README.md
  index.js
  package.json
```

### Adding a template

When [adding a template](README.md#templates), you will need to run end-to-end tests (`yarn run test:e2e:templates`) to update all the [snapshots](https://facebook.github.io/jest/docs/en/snapshot-testing.html). These snapshots are meant to avoid regressions that can potentially happen when we unintentionally update a behavior in the source code.

## Requirements

- [Node](https://nodejs.org) ≥ 8
- [Yarn](https://yarnpkg.com)
- [CocoaPods](https://cocoapods.org) (to run end-to-end tests for the [InstantSearch iOS template](https://github.com/algolia/create-instantsearch-app/tree/master/src/templates/InstantSearch%20iOS))

## Conventions

### Commits

This project follows the [conventional changelog](https://conventionalcommits.org/) approach. This means that all commit messages should be formatted using the following scheme:

```
type(scope): description
```

These commits are then used to generate the [changelog](CHANGELOG.md).

## Workflow

### Filing issues

Creating issues, either for reporting a bug or asking for a new feature is always great. [When doing so](https://github.com/algolia/create-instantsearch-app/issues/new/choose), you'll get asked what kind of issue you want to create. Each of these templates will help you create an effective report.

### Contributing to the code

Code contributions are always welcome, although you should make sure to [open an issue](https://github.com/algolia/create-instantsearch-app/issues/new/choose) to notice us what you plan to do.

You will need to follow these steps:

- [Fork the repository](https://help.github.com/articles/fork-a-repo/)
- Clone your fork
- Install the dependencies: `yarn`
- [Create a new branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository/#creating-a-branch)
  - `fix/issue-number` for a fix
  - `feat/name-of-the-feature` for a feature
  - `docs/what-you-changed` for documentation
- Make your changes
- Run tests:
  - `yarn lint`
  - `yarn test`
  - `yarn test:e2e`
- [Create a pull request](https://help.github.com/articles/creating-a-pull-request/)

We will then review your pull request!

### Release

We rely on [Ship.js](https://github.com/algolia/shipjs) to release new versions of Create InstantSearch App.

You need to have `GITHUB_TOKEN` added to your `.env` file. You can create a [personal access token](https://github.com/settings/tokens).

```sh
yarn release
```

It will create a pull request for the next release. When it's reviewed, approved and merged, CircleCI will automatically publish it to npm.

### Updating templates on CodeSandbox

If the InstantSearch versions are outdated in the CodeSandbox templates, make sure you're on the `master` branch and that your working directory is clean, then run:

```
npm run release-templates
```

It will regenerate the templates, fetch the latest InstantSearch versions from the npm index and push to the [`templates`](https://github.com/algolia/create-instantsearch-app/tree/templates) branch (usable on CodeSandbox).

---

Thank you for contributing!
