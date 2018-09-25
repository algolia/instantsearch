---
title: Template
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/__Template__.md
---

Oh you're gonna love templates.

<a class="btn btn-static-theme" href="stories/?selectedKind=Template">🕹 try out live</a>

## Usage

```html
<ais-template :option="value"></ais-template>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
option | Type | `defaultValue` | An option | yes
optionTwo | Type | `defaultValue` | An option2 | no

classNames | Object | | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ canRefine: boolean, refine: (value: string) => void, createURL: (value: string) => string }` | Slot to override the DOM output

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-Template` | Container class
`ais-Template-item` | An item
`ais-Template-item--selected` | Selected item
