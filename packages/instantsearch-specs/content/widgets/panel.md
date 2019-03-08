---
title: Panel
type: widget
html: |
  <div class="ais-Panel">
    <div class="ais-Panel-header">
      <span>Header</span>
    </div>
    <div class="ais-Panel-body">Panel content</div>
    <div class="ais-Panel-footer">Footer</div>
  </div>
alt1: Collapsible
althtml1: |
  <div class="ais-Panel ais-Panel--collapsible">
    <div class="ais-Panel-header">
      <span>Header</span>
      <button class="ais-Panel-collapseButton" aria-expanded="true">
        <svg class="ais-Panel-collapseIcon" width="1em" height="1em" viewBox="0 0 500 500">
          <path d="M250 400l150-300H100z" fill="currentColor" />
        </svg>
      </button>
    </div>
    <div class="ais-Panel-body">Panel content</div>
    <div class="ais-Panel-footer">Footer</div>
  </div>
alt2: Collapsed
althtml2: |
  <div class="ais-Panel ais-Panel--collapsible ais-Panel--collapsed">
    <div class="ais-Panel-header">
      <span>Header</span>
      <button class="ais-Panel-collapseButton" aria-expanded="false">
        <svg class="ais-Panel-collapseIcon" width="1em" height="1em" viewBox="0 0 500 500">
          <path d="M100 250l300-150v300z" fill="currentColor" />
        </svg>
      </button>
    </div>
    <div class="ais-Panel-body">Panel content</div>
    <div class="ais-Panel-footer">Footer</div>
  </div>
classes:
  - name: .ais-Panel
    description: the root div of the Panel
  - name: .ais-Panel--collapsible
    description: the root div of the collapsible Panel
  - name: .ais-Panel--collapsed
    description: the root div of the collapsed collapsible Panel
  - name: .ais-Panel-header
    description: the header of the Panel (optional)
  - name: .ais-Panel-body
    description: the body of the Panel
  - name: .ais-Panel-footer
    description: the footer of the Panel (optional)
  - name: .ais-Panel-collapseButton
    description: the button that collapses the panel (mandatory when the panel is collapsible)
  - name: .ais-Panel-collapseIcon
    description: the icon in the button that collapses the panel (mandatory when the panel is collapsible)
options:
  - name: header
    description: Text to put before the widget
  - name: footer
    description: Text to put after the widget
  - name: collapsible
    description: Makes the panel collapsible
---
