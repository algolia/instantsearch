---
title: Highlight
type: widget
html: |
  <span class="ais-Highlight"><span class="ais-Highlight-nonHighlighted">This is the</span> <em class="ais-Highlight-highlighted">highlighted text</em></span>
classes:
  - name: .ais-Highlight
    description: the root span of the widget
  - name: .ais-Highlight-highlighted
    description: the highlighted text
  - name: .ais-Highlight-nonHighlighted
    description: the normal text
options:
  - name: highlightTag
    default: em
    description: DOM tag to use for the highlighted parts, in addition to the classes
---
