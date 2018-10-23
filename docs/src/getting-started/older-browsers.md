---
title: Compatibility with older browsers
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 5
editable: true
githubSource: docs/src/getting-started/older-browsers.md
---

Vue InstantSearch works in Evergreen browsers (latest 2 versions of Safari, Chrome, Firefox, Edge), and can be made to work in older browsers with polyfills enabled.

While not a complete list, here's some things that we use that need to be polyfilled for older browsers:

- `Object.assign`
- `Object.keys`

Further more all ES5 features are also necessary to be polyfilled.

A good service you can add to your website to try this out is [polyfill.io](https://polyfill.io).
