---
title: Styling
layout: guide.pug
nav_groups:
  - core
nav_sort: 1
---

Welcome to the react-instantsearch theming tutorial!

`react-instantsearch` aims to provide the best search experience your way! We believe that theming is a big part when comes the customization of the search experience. That's why react-instantsearch uses [`react-themeable`](https://github.com/markdalgleish/react-themeable) to provides easily customizable widgets. 

In this tutorial, we'll cover only css modules as theming option with `react-themeable`. However, it supports much more options and you may find one that might fit your current stack better ([Check their website](https://github.com/markdalgleish/react-themeable)). 

On top of that, each widgets is shipped with class names that you can use directly if you want. 

In order to get you started with styling, we are going to use the example you made in the [Getting Started Tutorial](gettingstarted.html) and add some style to it. 
If you haven't follow the [Getting Started Tutorial](gettingstarted.html) yet, please do and comeback here right after. 

In this tutorial, you'll learn: 

* The concept of theme in react-instantsearch.
* How to customize a default provided theme. 
* How to create a totally new theme for a widget.  

## What's a theme in react-instantsearch 

All widgets that render one or more DOM nodes accept a `theme` prop. This prop is a map of keys to corresponding `className` or `style` prop values. 

The different theme keys supported by components are described on their respective documentation page. 

By default, we provide `defaultClassNames` for each widgets but they are mostly not styled. However, the `SearchBox`, `RangeRatings`, `Range` and `Pagination` widgets are delivered with a built-in style and are ready to use without any configuration on your side. 

>Note: default styling in `react-instantsearch` is done using css-modules. However, you have nothing to import other than the component itself to enjoy our default themes. 
When building `react-instantsearch` we are using [babel-plugin-transform-inline-localize-css-import](https://github.com/algolia/babel-plugin-transform-inline-localize-css-import).
We've made this babel plugin in order to be able to embed both class names and styles inside our components. 

In this part, we've seen the following:

* What's a theme for react-instantsearch
* Some widgets are already styled and no-extra configuration is required to enjoy it

## Modify the SearchBox colors 

The `SearchBox` is the most opinionated widget that you will find in `react-instantsearch`. It's already styled out-of-the-box but the submit button background color may not fit your own theme.

Let's take a look at the [SearchBox documentation](SearchBox.html) to see what can be customized:

```
Theme
root, wrapper, input, submit, reset
```

If we want to add some styles to the submit button, we need tu use the `submit` key. 

To change it, let's create a new css file called `searchBox.css`. 

```css
.submit {
  background-color: #1E9C5E;
}
```

>Note: in this example we are using css-modules. For loading a css file, you need a specific loader. This loader will take the css file and convert it to an object with the following attributes: 

>```js
>{
>	//the generated class name will depend on the loader configuration.
>	submit: 'searchBox__submit_xxx'
>}
>```

Now that we have redefined the background color of the submit button to green, we need to import it. Also, for our SearchBox we don't want to redefine completely its theme. So we are going to use the `mergeClassNames` function provided by `react-instantsearch`.

```js
//We need to add mergeClassNames to our import
import {InstantSearch, Hits, SearchBox, hightlight, RefinementList, Pagination, CurrentFilters, mergeClassNames} from 'react-instantsearch';

//we need to import our custom SearchBox style
import searchBoxStyle from './searchbox.css';

// [...]

function Search() {
  return (
    <div className='container'>
      <CurrentFilters/>
      <SearchBox theme={mergeClassNames(SearchBox.defaultClassNames, searchBoxStyle)}/>
      <RefinementList attributeName="category" />
      <Hits itemComponent={Product} /> 
      <Pagination />
    </div>
  );
}
```

You can retrieve the default class names used by a widget by accessing the `defaultClassNames` attribute on a component. 
The goal of the [`mergeClassNames`]() function is to add your own class names to the default ones. It will create a new object, containing both default and new class names.
 
Now the searchBox has a green submit button and it has kept the default theme provided out-of-the-box. 

In this part, we've seen the following:

* Where to find the theme keys existing for each widgets
* How to extend a default theme
* How to use the `mergeClassNames` function

## Create a new theme for the RefinementList widget 

The default refinementList theme is not styled. Let's recreate a whole theme for it. 

Let's take a look at the [RefinementList documentation](RefinementList.html) to see what can be customized:

```
Theme
root, items, item, itemSelected, itemLabel, itemCount, showMore

Only for RefinementListLinks: itemLink
```

Fine, it's time to create a new css file called `refinementList.css` to define our new theme.

```css
.itemSelected {
  font-weight: 700;
  color: #1E9C5E;
}

.itemCount {
  color: #9AAEB5;
}

.itemCount:before {
  content: '(';
}

.itemCount:after {
  content: ')';
}
```

Then we need to import it and use it as our new `refinementList` theme:

```js
import {InstantSearch, Hits, SearchBox, hightlight, RefinementList, Pagination, CurrentFilters, mergeClassNames} from 'react-instantsearch';

import searchBoxStyle from './searchbox.css';
import refinementListStyle from './refinementList.css'

// [...]

function Search() {
  return (
    <div className='container'>
      <CurrentFilters/>
      <SearchBox theme={mergeClassNames(SearchBox, searchBoxStyle)}/>
      <RefinementList theme={refinementListStyle} attributeName="category" />
      <Hits itemComponent={Product} /> 
      <Pagination />
    </div>
  );
}
```

That's it. Now, our refinementList has a complete different theme. If you inspect the widget, you will see that every class names that was defined for our default currentFilters are gone. 
That's because if you're applying a theme without the `mergeClassNames` function, it will erase completely the default one. 

In this part, we've seen the following:

* How to redefine a theme completely using css-modules 

## Next steps

At this point, you know how to customize `react-instantsearch` widgets. 

Here are some suggested guides and reference that you might be interested in:
 - [Advanced examples using react-instantsearch](examples.html)
 - [The API for widgets and components](InstantSearch.html)
 - [All the other guides](guides.html)