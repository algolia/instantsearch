---
title: SearchBox
layout: api.ejs
nav_groups:
  - main
---

# SearchBox

The `SearchBox` widget is where users type their search queries.

## Props

Name | Type | Default | Description
:- | :- | :- | :-
`id` | `String` | `q` | URL state serialization key.
`focusShortcuts` | <code>[String &#124; Number]</code> | `['s', '/']` | List of keyboard shortcuts that focus the search box. Accepts key names and key codes.
`autoFocus` | `Boolean` | `false` | Should the search box be focused on render?
`searchAsYouType` | `Boolean` | `true` | Should we search on every change to the query? If you disable this option, new searches will only be triggered by clicking the search button or by pressing the enter key while the search box is focused.

### Theme

`root`, `wrapper`, `input`, `submit`, `reset`

### Translations

`submit`, `reset`, `submitTitle`, `resetTitle`, `placeholder`

## Implementing your own SearchBox

```
import {connectSearchBox} from 'instantsearch-react';

function MySearchBox(props) {
  return (
    <input
      value={props.query}
      onChange={e => props.refine(e.target.value)}
    />
  );
}

export default connectSearchBox(MySearchBox);
```
