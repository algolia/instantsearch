---
title: Customize widgets
mainTitle: Guides
layout: main.pug
name: customize
category: guides
withHeadings: true
navWeight: 20
editable: true
githubSource: docgen/src/guides/customization.md
---

## Customize widgets

InstantSearch.js comes bundled with a set of 15+ UI components. Each of them
has options to manipulate CSS classes or even modifying part of the HTML
output (templates).

To go a step further in terms of customization, InstantSearch.js offers connectors
that contain the logic of the widgets without their rendering.

## Introducing the connectors

Connectors are the render-less counterparts of the widgets. They encapsulate
all the logic needed for making search widgets. Each one of them is specialized
to make a certain type of widget.

Connectors are functions that will create a widget factory: a function that can
create widgets instances.

They follow the pattern:

```javascript
(rendering) => (widgetParameters) => Widget
```

In this guide, we will go through the implementation of the custom rendering of a
menu widget. In the end, we'll have a widget that behaves like a menu and that
uses a dropdown for the rendering.

Let's go step by step on how to write this custom widget.

## A custom menu with jQuery

In this example we will create a new custom widget using [connectMenu](connectors/connectMenu.html) connector.
We will cover step by step how to write a render function used by the connector.

For simplicity, we will write custom widgets with [jQuery](https://jquery.com/) to manipulate the DOM.

In the first three steps we focus on implementing the rendering function and then will connect it to InstantSearch.

## 1. Set up the DOM

Since we use jQuery in these examples, we want to update only the changing parts of the markup at every render.

To help you to do that, the connectors API provides `isFirstRendering` a boolean as second argument of the render function. We can leverage this to insert the initial markup of your custom widget.

```javascript
const customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    // insert needed markup in the DOM
    // here we want a `<select></select>` element and the title
    $(window.document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );
  }
}
```

If you use a rendering library such as React, you can omit this part because React will compute this for you.


## 2. Display the available dropdown options

Then, on every render we want to update and insert the available menu items as `<option>` DOM nodes:

```javascript
const customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    $(document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );
  }

  // `renderParams` is an object containing all the information
  // you need to create a custom widget.
  const items = renderParams.items;

  // Transform `items[]` to HTML markup:
  //
  // each item comes with a `value` and `label`, it will also have a boolean to true
  // called `isRefined` when the current menu item is selected by the user.
  const optionsHTML = items.map(item => `
    <option value="${item.value}" ${item.isRefined ? ' selected' : ''}>
      ${item.label} (${item.count})
    </option>`
  );

  // then replace the content of `<select></select>` node with the new menu items markup.
  $(document.body).find('select').html(optionsHTML);
}
```

Now we have all the menu options displayed on the page but nothing is updating when the user selects a new option. Let's connect the dropdown to the search.


## 3. Make it interacts with the search results

Menu connector comes with a `refine()` function in the first argument `renderParams` object.
You need to call this `refine()` function every time a user select another option to *refine* the search results:

```javascript
const customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    $(document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );

    // We will bind the `<select>` change event on first render
    // because we don't want to create new listeners on every render
    // for potential performance issues:
    const refine = renderParams.refine;

    // we will use `event.target.value` to identify
    // which option is selected and then refine it:
    $(document.body).find('select').on('click', function(event) {
      refine(event.target.value);
    });
  }

  const items = renderParams.items;
  const optionsHTML = items.map(function(item) {
    return (
      '<option value="' + item.value + '"' + (item.isRefined ? ' selected' : '') + '>' +
      item.label + '(' + item.count ')' +
      '</option>'
    );
  });
  $(document.body).find('select').html(optionsHTML);
}
```

Now every time a user selects a new option in the dropdown menu, it triggers a new search to refine the search results!


## 4. Mount the custom menu dropdown widget on your page

We've just written the render function, we can now use it with the menu connector. This will create a new widget factory for our custom dropdown widget.

Let's use this factory in your search:

```javascript
const customMenuRenderFn = function(renderParams, isFirstRendering) {
  if (isFirstRendering) {
    $(document.body).append(
      '<h1>My first custom menu widget</h1>' +
      '<select></select>'
    );

    const refine = renderParams.refine;
    $(document.body).find('select').on('click', function(event) {
      refine(event.target.value);
    });
  }

  const items = renderParams.items;
  const optionsHTML = items.map(function(item) {
    return (
      '<option value="' + item.value + '"' + (item.isRefined ? ' selected' : '') + '>' +
      item.label + '(' + item.count ')' +
      '</option>'
    );
  });
  $(document.body).find('select').html(optionsHTML);
}

// Create a new factory of the custom menu select widget:
const dropdownMenu = instantsearch.connectors.connectMenu(customMenuRenderFn);

// Instantiate custom widget and display it on the page.
//
// Custom widgets that are created with connectors accepts
// the same options as a built-in widget, for instance
// the menu widget takes a mandatory `attributeName` option
// so we have to do the same:
search.addWidget(
  dropdownMenu({
    attributeName: 'categories'
  })
);
```

This example works on a single DOM element, which means that you won't be able to re-use it for another attribute.

## 5. Make it reusable!

Connectors are meant to be reusable, it is important to be able to pass options to
the rendering of each single widget instance when instantiating them.

That's why all the options passed to the newly created widget factory will be forwarded to the
rendering.

Let's update our custom render function to be able to configure the DOM element where the widget is mounted and also the title:

```javascript
const customMenuRenderFn = function(renderParams, isFirstRendering) {
  // widgetParams contains all the original options used to instantiate the widget on the page.
  const container = renderParams.widgetParams.containerNode;
  const title = renderParams.widgetParams.title || 'My first custom menu widget';

  if (isFirstRendering) {
    // replace `document.body` with the container provided by the user
    // and also the new title
    $(container).append(
      '<h1>' + title + '</h1>' +
      '<select></select>'
    );

    const refine = renderParams.refine;
    $(container).find('select').on('click', function(event) {
      refine(event.target.value);
    });
  }

  const items = renderParams.items;
  const optionsHTML = items.map(item => {
    return (
      `<option value="${item.value}"${item.isRefined ? ' selected' : ''}>${item.label}(${item.count})</option>`
    );
  });
  $(container).find('select').html(optionsHTML);
}

const dropdownMenu = instantsearch.connectors.connectMenu(customMenuRenderFn);

// Now you can use the dropdownMenu at two different places in the DOM:
// (since they use the same `attributeName` they will display the same options)
search.addWidget(
  dropdownMenu({
    attributeName: 'categories',
    containerNode: '#first-dropdown',
    title: 'First dropdown'
  })
);

search.addWidget(
  dropdownMenu({
    attributeName: 'categories',
    containerNode: '#second-dropdown',
    title: 'Second dropdown'
  })
);
```

With these steps we introduced a way to provide custom parameters:
  * a DOM container
  * a title

And voilà, we have covered how to write a simple custom widget using connectors 🎉 !

Now you can [read more about connectors](../connectors.html) in the docs and create more advanced usages with the same simplicity.  



Feel free to share with the [community](https://discourse.algolia.com) your custom widgets 🙏
