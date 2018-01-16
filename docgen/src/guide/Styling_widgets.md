---
title: Styling widgets
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 80
---

All widgets under the `react-instantsearch/dom` namespace are shipped with fixed CSS class names.

The format for those class names is `ais-NameOfWidget__elementModifier`.

The different class names used by every widgets are described on their respective documentation page. You
can also inspect the underlying DOM and style accordingly.

## Styling icons

You can style icons colors too, for example the `SearchBox` ones:

```css
.ais-SearchBox__reset svg,
.ais-SearchBox__button svg {
  fill: red
}
```

## Loading the theme

We do not load any CSS into your page automatically but we provide an Algolia theme that you can load
manually.

### Via CDN

The theme is available on [jsDelivr](https://www.jsdelivr.com/):
- minified: https://cdn.jsdelivr.net/npm/react-instantsearch-theme-algolia@4.4.1
- unminified: https://cdn.jsdelivr.net/npm/react-instantsearch-theme-algolia@4.4.1/style.css

You can either copy paste the content in your own app or use a direct link to jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/react-instantsearch-theme-algolia@4.4.1">
```

### Via npm, Webpack

```shell
npm install react-instantsearch-theme-algolia --save
npm install sass-loader style-loader css-loader autoprefixer postcss-loader --save-dev
```

App.js:
```jsx
import 'react-instantsearch-theme-algolia/style.scss';
// import 'react-instantsearch-theme-algolia/style.css'
// import 'react-instantsearch-theme-algolia/style.min.css'
```

webpack.config.babel.js:
```jsx
import autoprefixer from 'autoprefixer';

export default {
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ['style?insertAt=top', 'css', 'postcss', 'sass'],
      },
    ],
  },
  postcss: [autoprefixer()],
}
```

### Other bundlers

Any other module bundler like Browserify can be used to load our CSS. React InstantSearch
does not rely on any specific module bundler or module loader.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Widgets.html">← Widgets</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide//Highlighting_results.html">Highlighting results →</a>
    </div>
</div>
