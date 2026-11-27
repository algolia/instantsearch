---
layout: ../../layouts/WidgetLayout.astro
title: Stats
type: widget
html: |
  <div class="ais-Stats">
    <span class="ais-Stats-text">20,337 results found in 1ms</span>
    <span class="ais-Stats-announcement" role="status" aria-live="polite" aria-atomic="true" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;"></span>
  </div>
classes:
  - name: .ais-Stats
    description: the root div of the widget
  - name: .ais-Stats-text
    description: the text of the widget
  - name: .ais-Stats-announcement
    description: the visually hidden live region announcing the result count to assistive technologies when it changes
---
