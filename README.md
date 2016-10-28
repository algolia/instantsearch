** WORK IN PROGRESS **

We are currently working on react-instantsearch. Roadmap: https://github.com/algolia/instantsearch.js/projects/1

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Project structure](#project-structure)
- [Development](#development)
- [Test](#test)
- [Lint](#lint)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Project structure

- `/(root, you are here):` This is the main entry point of instantsearch.js where we build, develop, test and document all the instantsearch flavors.
- `packages/`: actually published npm packages
- `packages/react-instantsearch`: Set of React Components for instantsearch (In development)
- `packages/instantsearch`: `react-instantsearch` wrapped as a vanilla library with string templating abilities for ease of use in non framework situations (no React, no Angular) (Not yet started)

# Development

We use our documentation website as the main way to develop instantsearch.js.

We recommend using [yarn](https://yarnpkg.com/en/docs/install) to install
your development environment.

```sh
yarn
npm start
```

Go to <http://localhost:3000>.

# Test

We have unit tests for all `packages/`:

```sh
npm test # one shot run, also lint
```

```sh
npm run dev # watch mode, no lint
```

# Lint

```sh
npm run lint # only changed files in dev, all files in CI
npm run lint:fix
```
