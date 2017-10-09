---
title: Menu
type: widget
html: |
  <div class="ais-Menu">
    <div class="ais-Menu-header ais-header">
      Header (optional)
    </div>
    <div class="ais-Menu-body ais-body">
      <ul class="ais-Menu-list">
        <li class="ais-Menu-item ais-Menu-item--selected">
          <a class="ais-Menu-link" href="some-link">
            Appliances
            <span class="ais-Menu-count">4,306</span>
          </a>
        </li>
        <li class="ais-Menu-item">
          <a class="ais-Menu-link" href="some-link">
            Audio
            <span class="ais-Menu-count">1,570</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="ais-Menu-footer ais-footer">
      Footer (optional)
    </div>
  </div>
classes:
  - name: .ais-Menu
    description: the root div of the widget
  - name: .ais-Menu-header
    description: the header of the widget
  - name: .ais-Menu-body
    description: the body of the widget
  - name: .ais-Menu-list
    description: the list of all menu items
  - name: .ais-Menu-item
    description: the menu list item
  - name: .ais-Menu-item--selected
    description: the selected menu list item
  - name: .ais-Menu-link
    description: the clickable menu element
  - name: .ais-Menu-count
    description: the count of values for each item
  - name: .ais-Menu-footer
    description: the footer of the widget
---
