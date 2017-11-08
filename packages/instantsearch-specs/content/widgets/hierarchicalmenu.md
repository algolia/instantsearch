---
title: HierarchicalMenu
type: widget
html: |
  <div class="ais-HierarchicalMenu">
    <div class="ais-HierarchicalMenu-header ais-header">
      Hierarchical menu
    </div>
    <div class="ais-HierarchicalMenu-body ais-body">
      <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0">
        <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--selected">
          <a class="ais-HierarchicalMenu-link" href="#">Appliances <span class="ais-HierarchicalMenu-count">4,306</span></a>
          <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl1">
            <li class="ais-HierarchicalMenu-item">
              <a class="ais-HierarchicalMenu-link" href="#">Dishwashers <span class="ais-HierarchicalMenu-count">181</span></a>
            </li>
            <li class="ais-HierarchicalMenu-item">
              <a class="ais-HierarchicalMenu-link" href="#">Fans <span class="ais-HierarchicalMenu-count">91</span></a>
            </li>
          </ul>
        </li>
        <li class="ais-HierarchicalMenu-item">
          <a class="ais-HierarchicalMenu-link" href="#">Audio <span class="ais-HierarchicalMenu-count">1,570</span></a>
        </li>
      </ul>
    </div>
    <div class="ais-HierarchicalMenu-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-HierarchicalMenu
    description: the root div of the widget
  - name: .ais-HierarchicalMenu-header
    description: the header of the widget (optional)
  - name: .ais-HierarchicalMenu-body
    description: the body of the widget
  - name: .ais-HierarchicalMenu-list
    description: the list of menu items
  - name: .ais-HierarchicalMenu-list--lvl0
    description: the first level of menu items
  - name: .ais-HierarchicalMenu-list--lvlx
    description: the x nested level of menu items
  - name: .ais-HierarchicalMenu-item
    description: the menu list item
  - name: .ais-HierarchicalMenu-item--selected
    description: the selected menu list item
  - name: .ais-HierarchicalMenu-link
    description: the clickable menu element
  - name: .ais-HierarchicalMenu-count
    description: the count of values for each item
  - name: .ais-HierarchicalMenu-footer
    description: the footer of the widget (optional)
---
