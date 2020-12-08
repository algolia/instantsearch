---
title: ReverseHighlight
type: widget
html: |
  <span class="ais-ReverseHighlight"><span class"ais-ReverseHighlight-nonHighlighted">This is the</span> <mark class="ais-ReverseHighlight-highlighted">reversed highlighted text</mark></span>
classes:
  - name: .ais-ReverseHighlight
    description: the root span of the widget
  - name: .ais-ReverseHighlight-highlighted
    description: the reverse highlighted text
  - name: .ais-ReverseHighlight-nonHighlighted
    description: the normal text
options:
  - name: highlightTag
    default: mark
    description: DOM tag to use for the reversed highlighted parts, in addition to the classes
---
