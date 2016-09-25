---
title: Styling
layout: guide.pug
nav_groups:
  - core
nav_sort: 1
---

All widgets that render one or more DOM nodes accept a `theme` prop. This prop is a map of keys to corresponding `className` or `style` prop values. 
The different theme keys supported by components are described on their respective documentation page. You can also provide themes using css-modules, Aphrodite, JSS and others if you want. 
See [`react-themeable`](https://github.com/markdalgleish/react-themeable) for the underlying implementation and options.

By default, we provide `defaultTheme` for each widgets using css-modules under the hood. Most widgets have empty default theme, but the `SearchBox`, `RangeRatings`, `Range` and `Pagination` widgets 
are delivered with a built-in one and are ready to use. 

You can access every default theme easily. Here is an example if you want to retrieve the `SearchBox` default theme:

```
const searchBoxDefaultTheme = SearchBox.defaultTheme;
```

### Example: Styling a SearchBox

#### Redefining class names 

If you want to use pure css on your side, either you can use the generated class names we provide for each widgets, or you can redefine your own. You can also directly use some css. 

```
import {SearchBox} from 'react-instantsearch';

export default function ThemedSearchBox(props) {
  return (
    <SearchBox
      {...props}
      theme={{
        root: 'MySearchBox',
        wrapper: 'MySearchBox__wrapper',
        input: {
          color: 'red',
        },
        submit: 'MySearchBox__submit',
        reset: {
          display: 'none',
        },
      }}
    />
  );
}
```

If you want to use css-modules, aphrodite and other libraries supported by react-themeable you will also need to use the `theme` prop. Please refer to the [`react-themeable documentation`](https://github.com/markdalgleish/react-themeable)
to see the correct syntax. 

Be aware that giving a theme prop to a widget will erase completely the existing default theme. 

#### Overriding some default theme properties 

For the `SearchBox`, `RangeRatings`, `Range` and `Pagination` widgets, maybe you only wants to redefine some properties like colors.
You can do that by retrieving their default themes and perform a merge with yours and then use the `theme` prop.

Check the [tourism source code](https://github.com/algolia/instantsearch.js/tree/v2/docgen/src/examples/tourism) for a real-life example. 
The slider overrides some of the default theme properties.





