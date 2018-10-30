---
title: Panel
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/Panel.md
---

The Panel widget wraps other widgets in a consistent panel design. It also reacts, indicates and set CSS classes when widgets are no more relevant for refining. E.g. when a RefinementList becomes empty because of the current search results.

<a class="btn btn-static-theme" href="stories/?selectedKind=Panel">🕹 try out live</a>

## Usage

```html
<ais-panel>
  <template slot="header">Brand</template>
  <ais-refinement-list attribute="brand" />
</ais-panel>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
class-names | Object | `{}` | Override class names | no

## Slots

name | scope | Description
---|---|---
`header` | - | Adds a header to the widget
`default` | - | Adds a body to the widget
`footer` | - | Adds a footer to the widget


## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-Panel` | The root div of the Panel
`ais-Panel--noRefinement` | The root div of the widget with no refinement
`ais-Panel-header` | The header of the Panel (optional)
`ais-Panel-body` | The body of the Panel
`ais-Panel-footer` | The footer of the Panel (optional)
