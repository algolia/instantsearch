---
title: Range
layout: api.ejs
nav_groups:
  - widgets
---

# Range

Lets users filter results within a numerical range, based on an attribute.

## Props

<!-- props default ./index.js -->

Name | Type | Default |Description
:- | :- | :- | :-
`attributeName` | `string` | | Name of the attribute for faceting
`defaultValue` | `?{min: number, max: number}` | | Default state of the widget.
`min` | `?number` | | Minimum value of the range. When this isn't set, the minimum value will be automatically computed by Algolia using the data in the index.
`max` | `?number` | | Maximum value of the range. When this isn't set, the maximum value will be automatically computed by Algolia using the data in the index.
`step` | `?number` | `1` | Every handle move will jump that number of steps.
`id` | `?string` | | URL state serialization key. Defaults to the value of `attributeName`. The state of this widget takes the shape of an object `{min: ?number, max: ?number}`.

### Theme

`root`, `handles`, `handle`, `handleActive`, `handleDot`, `handleTooltip`, `tracks`, `track`, `bounds`, `bound`, `boundMin`, `boundMax`

### Translations

`value(n)`

## Implementing your own Range

See [Making your own widgets](../Customization.md) for more information on how to use the `Range.connect` HOC.

```
import {Range} from 'instantsearch-react';

function MyRange(props) {
  return (
    <div>
      Between
      <input
        type="number"
        min={props.min}
        max={props.max}
        value={props.value.min}
      />
      and
      <input
        type="number"
        min={props.min}
        max={props.max}
        value={props.value.max}
      />
    </div>
  );
}

// `Range.connect` accepts the same `id`, `attributeName`, `defaultValue`, `min`
// and `max` props as `Range`.
// If not set, `min` and `max` are automatically filled.
export default Range.connect(MyRange);
```
