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

- **Bug report**. Is something not working as expected? [Send a bug report](https://github.com/algolia/instantsearch.js/issues/new?template=BUG_REPORT.yml&labels=triage,Package%3A%20instantsearch.css).
- **Feature request**. Would you like to add something to the library? [Send a feature request](https://github.com/algolia/instantsearch.js/issues/new?template=Feature_request.md&labels=Package%3A%20instantsearch.css).
- **Documentation**. Did you find a typo in the doc? [Open an issue](https://github.com/algolia/instantsearch.js/issues/new?labels=Package%3A%20instantsearch.css) and we'll take care of it.
- **Development**. If you don't know where to start, you can check the [open issues](https://github.com/algolia/instantsearch.js/issues?q=is%3Aopen+is%3Aissue+label%3A%22Package%3A+instantsearch.css%22).

To start contributing to the code, you need to:

1.  [Fork the project](https://help.github.com/articles/fork-a-repo/)
2.  [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
3.  Install the dependencies: `yarn`

Please read [our contribution process](../../CONTRIBUTING.md) to learn more.

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
