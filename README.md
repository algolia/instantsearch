[![instantsearch.js logo][readme-logo]][website-url]

[![Version][version-svg]][package-url] [![Build Status][travis-svg]][travis-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url]

**instantsearch.js** is a library of UI widgets to help you build the best instant-search experience with [Algolia's Hosted Search API](https://www.algolia.com/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=InstantSearch%20repository).

Have a look at the website: [https://community.algolia.com/instantsearch.js/][instantsearch-website].

## Demo

Here is an example of what you could easily build with `instantsearch.js` and
Algolia:

[![instantsearch.js animated demo][readme-animated]][website-url]

You can find the complete [tutorial on how it was done](https://www.algolia.com/doc/search/instant-search) on our website.

[travis-svg]: https://img.shields.io/travis/algolia/instantsearch.js/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/algolia/instantsearch.js
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/instantsearch.js.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=instantsearch.js
[version-svg]: https://img.shields.io/npm/v/instantsearch.js.svg?style=flat-square
[package-url]: https://npmjs.org/package/instantsearch.js
[readme-logo]: ./docs/readme-logo.png
[readme-animated]: ./docs/readme-animated.gif
[website-url]: https://community.algolia.com/instantsearch.js/
[instantsearch-website]: https://community.algolia.com/instantsearch.js/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=InstantSearch%20repository
[instantsearch-website-docs]: https://community.algolia.com/instantsearch.js/documentation/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=InstantSearch%20repository

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
  - [With the jsDelivr CDN](#with-the-jsdelivr-cdn)
  - [With npm, browserify, webpack](#with-npm-browserify-webpack)
- [Quick Start](#quick-start)
- [Browser support](#browser-support)
- [Development workflow](#development-workflow)
- [Test](#test)
- [Functional tests](#functional-tests)
  - [It's not working!](#its-not-working)
- [License](#license)
- [Contributing](#contributing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

### With the jsDelivr CDN

instantsearch.js is available on [jsDelivr](https://www.jsdelivr.com/):

```html
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.css" />
<script src="//cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.js"></script>
```

#### Other CDNS

We recommend using jsDelivr, but algoliasearch is also available at:

- CDNJS: https://cdnjs.com/libraries/instantsearch.js
- npmcdn:
  - https://npmcdn.com/instantsearch.js@1/dist/instantsearch.min.js
  - https://npmcdn.com/instantsearch.js@1/dist/instantsearch.min.css

Using jsDelivr you will get auto updates for all the 1.x.x versions without any breaking change.

### With npm, browserify, webpack

```sh
npm install instantsearch.js --save
```

## Quick Start

See our [documentation website][instantsearch-website-docs] for complete docs.

```js
var instantsearch = require('instantsearch.js');
// or use the 'instantsearch' global (window) variable when using the jsDelivr build

var search = instantsearch({
  appId: appId
  apiKey: apiKey
  indexName: indexName
});

// add a searchBox widget
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for libraries in France...'
  })
);

// add a hits widget
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits-container',
    hitsPerPage: 10
  })
);

// start
search.start();
```
## Browser support

We natively support IE10+ and all other modern browsers without any dependency need
on your side.

To get < IE10 support, please insert this code in the `<head>`:

```html
<meta http-equiv="X-UA-Compatible" content="IE=Edge">
<!--[if lte IE 9]>
  <script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
<![endif]-->
```

We use the [polyfill.io](https://cdn.polyfill.io/v2/docs/).

## Development workflow

Only the local example:

```sh
npm run dev
# open http://localhost:8080
# make changes in your widgets, or in example/app.js
```

Local example and docs:

```sh
npm run dev:docs
# open http://localhost:4000/
```

## Test

```sh
npm test # unit tests, jsdom + lint
npm run test:watch # unit tests, jsdom, watch

npm run test:browser # unit tests, chrome
npm run test:browser:watch # unit tests, chrome, watch
npm run test:browser -- --browsers ChromeCanary # force Chrome Canary
```

Most of the time `npm run test:watch` is sufficient.

## Functional tests

You need [docker](https://docs.docker.com/engine/installation/).

Run it like so:

```sh
docker pull elgalu/selenium:2.50.1a
docker run --net="host" --privileged --name=grid -e VNC_PASSWORD=fun -e NOVNC=true elgalu/selenium:2.50.1a
```

Then run functional tests dev command with auto reload:

```sh
npm run test:functional:dev
```

You can see the live browser at http://localhost:26080/vnc.html (password: fun).

You can use the full webdriverio API: http://webdriver.io/api.html.

You can run the underlying web server for debugging purposes:

```sh
npm run test:functional:dev:debug-server
```

Useful when you want to modify the functional test app.

### It's not working!

Your docker installation must be compatible and ready to make the [--net="host"](https://docs.docker.com/engine/reference/run/#network-host) works.

## License

instantsearch.js is [MIT licensed](./LICENSE).

## Contributing

We have a [contributing guide](CONTRIBUTING.md), join us!
