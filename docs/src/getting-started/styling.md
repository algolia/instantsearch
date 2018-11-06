---
title: Styling
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 7
editable: true
githubSource: docs/src/getting-started/styling.md
---

All widgets under the `vue-instantsearch` namespace are shipped with fixed CSS class names.

The format for those class names is `ais-NameOfWidget-element--modifier` (SUIT CSS), where `ais` stands for Algolia InstantSearch.

The different class names used by each widget are described on their respective documentation pages. You
can also inspect the underlying DOM and style accordingly.

## Styling icons

You can style the colors of icons too, for example the `SearchBox` ones:

```css
ais-SearchBox-resetIcon,
ais-SearchBox-submitIcon {
  fill: red;
}
```

## Loading the theme

We do not load any CSS into your page automatically but we provide two themes that you can load
manually:

* reset.css
* algolia.css

We **strongly** recommend that you use at least **reset.css** in order to neglect visual side effects caused by the new HTML semantics.

The `reset` theme CSS is included within the `algolia` CSS, so there is no need to import it separately when you are using the `algolia` theme.

### Via CDN

The themes are available on jsDelivr and other CDNs:

minified:

* https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/reset-min.css
* https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/algolia-min.css

unminified:

* https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/reset.css
* https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/algolia.css

You can either copy paste the content into your own app or use a direct link to jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/reset-min.css">

<!-- or -->

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/algolia-min.css">
```

### Via npm and a bundler

```shell
npm install instantsearch.css --save
```

Then in your JS entry point (`main.js`) you need to import it:

```javascript
import 'instantsearch.css/themes/reset.css';

// or

import 'instantsearch.css/themes/algolia.css';
```

Make sure you set up your bundler to deal with css imports.

## Overriding class names

You can override existing class names with your own ones.

To do so, you need to provide an object as the `class-names` property, which will map default class names to the ones of your choice.

For example:

```html
<ais-pagination :class-names="{
  'ais-Pagination': 'pagination',
  'ais-Pagination-item': 'page',
  'ais-Pagination-item--active': 'active',
}">
</ais-pagination>
```

This will replace custom classes where applicable, while leaving the rest of the class names untouched.

## Using slots

By using slots, you can customize the HTML of a given section of a component.

Slots come in two flavors, simple `slots` and `scoped slots`.

`scoped slots` will provide your template with an access to some contextual information, whereas simple `slots` will not.

Here is an example of adding a header to a `RefinementList` component:

```html
<ais-panel>
  <h3 slot="header">Filter by Brand</h3>
  <ais-refinement-list attribute="brand"></ais-refinement-list>
</ais-panel>
```

When you use a `scoped slot`, you need to tell your template to get the scope.

```html
<ais-hits>
  <template slot="item" slot-scope="{ item }">
    <h2>{{ item.name }}</h2>
  </template>
</ais-hits>
```

A list of available slots is available on each component's dedicated documentation page. Those pages also mention the available `scope properties` in case of `scoped slot`.

## Overriding templates with `inline-template`

Sometimes, slots are not sufficient to adapt the HTML structure to your needs.

In that case, you can replace the entire template of a component.

**Hint:** To do so we recommend you always copy the existing template.

You can tell Vue.js to override the template by specifying an `inline-template` attribute on a component.

For example, render results in a `table` instead of in `<div>`s

```html
<ais-hits inline-template>
  <table v-if="state">
    <tbody>
      <tr v-for="item in items" :key="item.objectID">
        <td>{{ item.name }}</td>
        <td>{{ item.description }}</td>
      </tr>
    </tbody>
  </table>
</ais-hits>
```

It is recommended to not overuse this `inline-template` feature because it makes it hard to know about the current scope. In the previous example, the `results` variable is provided by the `ais-results` component, not the current scope.
