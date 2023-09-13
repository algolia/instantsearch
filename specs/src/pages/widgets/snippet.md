---
layout: ../../layouts/WidgetLayout.astro
title: Snippet
type: widget
html: |
  <span class="ais-Snippet"><span class="ais-Snippet-nonHighlighted">This is the</span> <mark class="ais-Snippet-highlighted">snippet text</mark></span>
classes:
  - name: .ais-Snippet
    description: the root span of the widget
  - name: .ais-Snippet-highlighted
    description: the highlighted text
  - name: .ais-Snippet-nonHighlighted
    description: the normal text
options:
  - name: highlightTag
    default: em
    description: DOM tag to use for the highlighted parts, in addition to the classes
---
