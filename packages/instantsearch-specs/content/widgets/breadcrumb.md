---
title: Breadcrumb
type: widget
html: |
  <div class="ais-Breadcrumb">
    <div class="ais-Breadcrumb-header ais-header">
      Breadcrumb
    </div>
    <div class="ais-Breadcrumb-body ais-body">
      <ul class="ais-Breadcrumb-list">
        <li class="ais-Breadcrumb-item">
          <a class="ais-Breadcrumb-link" href="some-link">Home</a>
        </li>
        <li class="ais-Breadcrumb-item" aria-hidden="true">
          >
        </li>
        <li class="ais-Breadcrumb-item">
          <a class="ais-Breadcrumb-link" href="some-link">Cooking</a>
        </li>
        <li class="ais-Breadcrumb-item" aria-hidden="true">
          >
        </li>
        <li class="ais-Breadcrumb-item ais-Breadcrumb-item--selected">
          Kitchen textiles
        </li>
      </ul>
    </div>
    <div class="ais-Breadcrumb-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-Breadcrumb
    description: the root div of the widget
  - name: .ais-Breadcrumb-header
    description: the header of the widget (optional)
  - name: .ais-Breadcrumb-body
    description: the body of the widget
  - name: .ais-Breadcrumb-list
    description: the list of all breadcrumb items
  - name: .ais-Breadcrumb-item
    description: the breadcrumb navigation item
  - name: .ais-Breadcrumb-item--selected
    description: the selected breadcrumb item
  - name: .ais-Breadcrumb-link
    description: the clickable breadcrumb element
  - name: .ais-Breadcrumb-footer
    description: the footer of the widget (optional)
---
