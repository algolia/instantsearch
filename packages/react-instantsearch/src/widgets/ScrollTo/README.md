---
title: ScrollTo
layout: api.pug
nav_groups:
  - widgets
---

# ScrollTo

Scrolls the window to itself when the page changes. Note that if you've provided a custom `id` prop to your `Pagination` component, you will need to provide it to this component as well as the `scrollOn` prop.

## Props

<!-- props default ./index.js -->

## Implementing your own ScrollTo

See [Making your own widgets](../Customization.md) for more information on how to use the `ScrollTo.connect` HOC.

```
import {Children, Component} from 'react';
import {ScrollTo.connect} from 'react-instantsearch';

class MyScrollTo extends Component {
  componentDidUpdate(prevProps) {
    const {value} = this.props;
    if (value !== prevProps.value) {
      const el = findDOMNode(this);
      el.scrollIntoView();
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

// `ScrollTo.connect` accepts the same `scrollOn` prop as `ScrollTo`.
export default ScrollTo.connect(MyScrollTo);
```
