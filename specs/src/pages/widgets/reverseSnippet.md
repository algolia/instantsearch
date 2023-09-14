---
layout: ../../layouts/WidgetLayout.astro
title: ReverseSnippet
type: widget
html: |
  <span class="ais-ReverseSnippet"><span class="ais-ReverseSnippet-nonHighlighted">This is the</span> <mark class="ais-ReverseSnippet-highlighted">reversed snippet text</mark></span>
classes:
  - name: .ais-ReverseSnippet
    description: the root span of the widget
  - name: .ais-ReverseSnippet-highlighted
    description: the reverse snippet text
  - name: .ais-ReverseSnippet-nonHighlighted
    description: the normal text
options:
  - name: highlightTag
    default: mark
    description: DOM tag to use for the reversed highlighted parts, in addition to the classes
---
