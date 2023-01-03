<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Getting started](#getting-started)
- [Installation](#installation)
- [Available themes](#available-themes)
- [Browser support](#browser-support)
- [Implemented versions](#implemented-versions)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<p align="center">
  <p align="center">
    InstantSearch.css is a CSS library to style InstantSearch-powered search experiences.
  </p>
</p>

---

[![Version][version-svg]][package-url]
[![License][license-image]][license-url]
[![Build Status][ci-svg]][ci-url]
[![Website][website-svg]][website-url]

## Getting started

Using InstantSearch.css is as simple as adding this CSS code to your existing InstantSearch app:

```js
// Include only the reset
import 'instantsearch.css/themes/reset.css';

// Or include the full Satellite theme
import 'instantsearch.css/themes/satellite.css';
```

To learn more about the library, follow the guide on how to style your InstantSearch widgets:
- [InstantSearch.js](https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/js/#style-your-widgets)
- [React InstantSearch Hooks](https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/react-hooks/#style-your-widgets)
- [React InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/react/#style-your-widgets)
- [Vue InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/vue/#style-your-widgets)
- [Angular InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/angular/#style-your-widgets)

## Installation

```sh
npm install instantsearch.css
# or
yarn add instantsearch.css
```

## Available themes

InstantSearch.css exposes two themes:
- [Algolia](src/themes/algolia.scss)
- [Satellite](src/themes/satellite.scss)

If you don't need a theme, you can still use the [reset styles](src/themes/reset.scss) to start from a clean slate.

**The reset styles are included in all the provided themes.** You don't need to import them if you use a theme.

## Browser support

We support the **last two versions of major browsers** (Chrome, Edge, Firefox, Safari).

## Implemented versions

InstantSearch.css is a living standard. This table tracks down the version implemented in each InstantSearch flavor.

| Project                   | Version |
| ------------------------- | ------- |
| InstantSearch.js          | 7       |
| React InstantSearch Hooks | 7       |
| React InstantSearch       | 7       |
| Vue InstantSearch         | 7       |
| Angular InstantSearch     | 7       |


## Contributing

We welcome all contributors, from casual to regular 💙

- **Bug report**. Is something not working as expected? [Send a bug report][contributing-bugreport].
- **Feature request**. Would you like to add something to the library? [Send a feature request][contributing-featurerequest].
- **Documentation**. Did you find a typo in the doc? [Open an issue][contributing-newissue] and we'll take care of it.
- **Development**. If you don't know where to start, you can check the open issues that are [tagged easy][contributing-label-easy], the [bugs][contributing-label-bug] or [chores][contributing-label-chore].

To start contributing to code, you need to:

1.  [Fork the project](https://help.github.com/articles/fork-a-repo/)
1.  [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1.  Install the dependencies: `yarn`

Please read [our contribution process](https://github.com/algolia/instantsearch.js/blob/master/CONTRIBUTING.md) to learn more.

## License

InstantSearch.css is [MIT licensed][license-url].

<!-- Badges -->

[version-svg]: https://img.shields.io/npm/v/instantsearch.css.svg?style=flat-square
[package-url]: https://npmjs.org/package/instantsearch.css
[ci-svg]: https://img.shields.io/circleci/project/github/algolia/instantsearch.js.svg?style=flat-square
[ci-url]: https://circleci.com/gh/algolia/instantsearch.js
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[website-svg]: https://img.shields.io/badge/website-instantsearchjs.netlify.app/specs-yellow?style=flat-square
[website-url]: https://instantsearchjs.netlify.app/specs/
[license-url]: LICENSE

<!-- Links -->

[contributing-bugreport]: https://github.com/algolia/instantsearch.js/issues/new?template=BUG_REPORT.yml&labels=triage,Library%3A%20InstantSearch.css
[contributing-featurerequest]: https://github.com/algolia/instantsearch.js/discussions/new?category=ideas&labels=triage,Library%3A%20InstantSearch.css&title=Feature%20request%3A%20
[contributing-newissue]: https://github.com/algolia/instantsearch.js/issues/new?labels=triage,Library%3A%20InstantSearch.css
[contributing-label-easy]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty%3A+Easy%22+label%3A%22Library%3A%20InstantSearch.css%22
[contributing-label-bug]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Bug%22+label%3A%22Library%3A%20InstantSearch.css%22
[contributing-label-chore]: https://github.com/algolia/instantsearch.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22Type%3A+Chore%22+label%3A%22Library%3A%20InstantSearch.css%22
