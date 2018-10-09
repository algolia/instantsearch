---
title: Common parameters
mainTitle: Widgets
layout: main.pug
category: widgets
withHeadings: true
navWeight: 90
editable: true
githubSource: docgen/src/widgets-common-api.md
---

## Common widget parameters

Most widgets share a common set of options. Here is a list of the one
that you'll encounter using the different widgets.

## `container`

The `container` represents the place where the widget will be rendered in your
HTML page. As a parameter, it can either be a CSS selector or a DOM element.

When used as a CSS selector, it is important that it identifies a single element.
Otherwise, the widget factory will use the first one returned by the browser, which
may be unpredictable.

This is usually one of the only attribute required to use a widget.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(
  instantsearch.widgets.searchbox({
    container: '#my-searchbox',
  })
);
```

## `cssClasses`

`cssClasses` is a parameter that let you specify one or more classes to add to
some specific element of the rendered widget. When available, this parameter is
an object of either string or array of strings. The different keys available
is defined in the widget reference.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(
  instantsearch.widgets.searchbox({
    container: '#search-box',
    cssClasses: {
      root: 'my-searchbox',
      input: ['searchbox-input', 'input', 'form-element'],
    },
  })
);
```

## `templates`

The `templates` are a way to customize the rendering of a widget using
string-based templates or functions.

In their string format, the templates should be written using
[mustache](https://mustache.github.io/mustache.5.html) (more specifically [Hogan](http://twitter.github.io/hogan.js/)).

Like the CSS classes, they can only be written for some specific parts of the rendered
widget.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#hits',
    templates: {
      header: 'Header',
      item: '{{#isRefined}}👉{{/isRefined}} {{value}} ({{count}})',
      // OR
      item: item =>
        `${item.isRefined ? '👉' : ''} ${item.value} (${item.count})`,
    },
  })
);
```

## `transformItems`

`transformItems` is used to return a transformed version of the data passed to the templates.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#categories',
    attribute: 'categories',
    transformItems: items =>
      items.map(item => ({
        ...item,
        label: item.label.toUpperCase(),
      })),
  })
);
```
