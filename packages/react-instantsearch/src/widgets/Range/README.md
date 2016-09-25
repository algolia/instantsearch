---
title: Range
layout: widget.pug
nav_groups:
  - widgets
---

# Range

Lets users filter results within a numerical range, based on an attribute.

There's also a `Range.Input`  which renders a range using inputs and a `Range.Ratings` which renders a list of ratings 
ranges. 

By default, the Range will render as a slider.

### Props

<!-- props default ./index.js -->

#### Theme

`root`, `handles`, `handle`, `handle_active`, `handleDot`, `handleTooltip`, `tracks`, `track`, `bounds`, `bound`, `boundMin`, `boundMax`

#### Translations

`value(n)`

## Range.Input

#### Theme

`root`, `labelMin`, `inputMin`, `labelMax`, `inputMax`, `submit`, `separator`

#### Translations

`submit`, `separator`

## Range.Ratings

#### Theme

`root`, `ratingLink`, `ratingLinkSelected` `ratingIcon`, `ratingIconEmpty` `ratingLabel`, `ratingCount`

#### Translations

`ratingLabel`


## Implementing your own Range

See [Making your own widgets](../Customization.md) for more information on how to use the `Range.connect` HOC.

```
import {Range} from 'react-instantsearch';

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
