---
layout: ../../layouts/WidgetLayout.astro
title: Highlight
type: widget
html: |
  <span class="ais-Highlight"><span class="ais-Highlight-nonHighlighted">This is the</span> <mark class="ais-Highlight-highlighted">highlighted text</mark></span>
classes:
  - name: .ais-Highlight
    description: the root span of the widget
  - name: .ais-Highlight-highlighted
    description: the highlighted text
  - name: .ais-Highlight-nonHighlighted
    description: the normal text
options:
  - name: highlightTag
    default: mark
    description: DOM tag to use for the highlighted parts, in addition to the classes
---
