---
title: Styling
layout: guide.pug
nav_groups:
  - core
nav_sort: 1
---

All widgets that render one or more DOM nodes accept a `theme` prop. This prop is a map of keys to corresponding `className` or `style` prop values. The different theme keys supported by components are described on their respective documentation page. See [`react-themeable`](https://github.com/markdalgleish/react-themeable) for the underlying implementation.

By default, the `theme` prop is initialized with `className`s that respect the [BEM](http://getbem.com/naming/) conventions: `Component(__element)*(--modifier)?`.

### Example: Styling a SearchBox

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
