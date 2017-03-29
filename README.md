[![React InstantSearch logo][readme-logo]][react-doc]

**Looking for instantsearch.js instead? Go to the [`develop`][instantsearch.js-v1-github-url] branch.**

## InstantSearch

This is the main README of the InstantSearch project.

Currently we support [React](https://facebook.github.io/react/)
and plain JavaScript (or Vanilla) via:
- ⚛ React and React Native ➡️ [React InstantSearch][react-doc]
- 🍦 Vanilla ➡️ [InstantSearch.js][vanilla-doc]

This current branch (v2) holds the code for React InstantSearch,
see [project status](#project-status) for more information on project structure.

## Installing

React InstantSearch is available in the npm registry. Install it:

```
yarn add react-instantsearch
```

Note: we use yarn to install dependencies but React InstantSearch is also installable via npm.

Detailed info on how to use InstantSearch can be found in the [documentation website][react-doc]
## Contributing, dev, release

We welcome all contributors, from beginner to advanced. You are only
one command away to start the developer environment, [read our CONTRIBUTING guide](CONTRIBUTING.md).

## Project status

[InstantSearch.js][instantsearch.js-v1-github-url] was our first instant-search related project.
We still support the current version (v1.x.x) of it. And you can still count on contributors to fix bugs.

In a near future this current repository will hold any instant-search related project:
- InstantSearch Core
- InstantSearch.js v2 (based on React InstantSearch)
- InstantSearch Vue
- InstantSearch Angular
- …

While we are in transition mode, the `v2` branch is the main development
branch for any of the upcoming projects.

The `develop` branch will soon be renamed `v1` and `v2` will be the new develop as
soon as we have instantsearch.js v2.

[readme-logo]: ./docgen/readme-logo.png
[react-doc]: https://community.algolia.com/instantsearch.js/react/
[vanilla-doc]: https://community.algolia.com/instantsearch.js/
[algolia-url]: https://www.algolia.com/
[react-url]: https://facebook.github.io/react/
[widgets-url]: https://community.algolia.com/instantsearch.js/react/widgets/
[connectors-url]: https://community.algolia.com/instantsearch.js/react/widgets/connectors/
[instantsearch.js-v1-github-url]: https://github.com/algolia/instantsearch.js/tree/develop
