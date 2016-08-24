---
title: ScrollTo
layout: api.ejs
nav_groups:
  - main
---

# ScrollTo

Scrolls the window to itself when the page changes. Note that if you've provided a custom `id` prop to your `Pagination` component, you will need to provide it to this component as well as the `scrollOn` prop.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`scrollOn` | `?string` | `p` | Widget state key on which to listen for changes.

## Implementing your own ScrollTo

See [Making your own widgets](../Customization.md) for more information on how to use the `connectScrollTo` HOC.

```
import {Children, Component} from 'react';
import {connectScrollTo} from 'instantsearch-react';

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

// `connectScrollTo` accepts the same `scrollOn` prop as `ScrollTo`.
export default connectScrollTo(MyScrollTo);
```
