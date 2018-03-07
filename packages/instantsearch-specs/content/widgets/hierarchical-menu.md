---
title: HierarchicalMenu
type: widget
html: |
  <div class="ais-HierarchicalMenu">
    <div class="ais-HierarchicalMenu-searchBox">
      <!-- SearchBox widget here -->
    </div>
    <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0">
      <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected">
        <a class="ais-HierarchicalMenu-link" href="#">
          <span class="ais-HierarchicalMenu-label">Appliances</span>
          <span class="ais-HierarchicalMenu-count">4,306</span>
        </a>
        <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child ais-HierarchicalMenu-list--lvl1">
          <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Dishwashers</span>
              <span class="ais-HierarchicalMenu-count">181</span>
            </a>
          </li>
          <li class="ais-HierarchicalMenu-item">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Fans</span>
              <span class="ais-HierarchicalMenu-count">91</span>
            </a>
          </li>
        </ul>
      </li>
      <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
        <a class="ais-HierarchicalMenu-link" href="#">
          <span class="ais-HierarchicalMenu-label">Audio</span>
          <span class="ais-HierarchicalMenu-count">1,570</span>
        </a>
      </li>
    </ul>
    <button class="ais-HierarchicalMenu-showMore">Show more</button>
  </div>
alt1: Show more disabled
althtml1: |
  <div class="ais-HierarchicalMenu">
    <div class="ais-HierarchicalMenu-searchBox">
      <!-- SearchBox widget here -->
    </div>
    <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0">
      <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected">
        <a class="ais-HierarchicalMenu-link" href="#">
          <span class="ais-HierarchicalMenu-label">Appliances</span>
          <span class="ais-HierarchicalMenu-count">4,306</span>
        </a>
        <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child ais-HierarchicalMenu-list--lvl1">
          <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Dishwashers</span>
              <span class="ais-HierarchicalMenu-count">181</span>
            </a>
          </li>
          <li class="ais-HierarchicalMenu-item">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Fans</span>
              <span class="ais-HierarchicalMenu-count">91</span>
            </a>
          </li>
        </ul>
      </li>
      <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent">
        <a class="ais-HierarchicalMenu-link" href="#">
          <span class="ais-HierarchicalMenu-label">Audio</span>
          <span class="ais-HierarchicalMenu-count">1,570</span>
        </a>
      </li>
    </ul>
    <button class="ais-HierarchicalMenu-showMore ais-HierarchicalMenu-showMore--disabled" disabled>Show more</button>
  </div>
alt2: With search and no results
althtml2: |
  <div class="ais-HierarchicalMenu">
    <div class="ais-HierarchicalMenu-searchBox">
      <div class="ais-SearchBox">
        <form class="ais-SearchBox-form" novalidate>
          <input class="ais-SearchBox-input" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Search for products" spellcheck="false" maxlength="512" type="search" value="" />
          <button class="ais-SearchBox-submit" type="submit" title="Submit the search query.">
            <svg class="ais-SearchBox-submitIcon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 40 40">
              <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
            </svg>
          </button>
          <button class="ais-SearchBox-reset" type="reset" title="Clear the search query." hidden>
            <svg class="ais-SearchBox-resetIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="10" height="10">
              <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
            </svg>
          </button>
          <span class="ais-SearchBox-loadingIndicator" hidden>
            <svg width="16" height="16" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444" class="ais-SearchBox-loadingIcon">
              <g fill="none" fillRule="evenodd">
                <g transform="translate(1 1)" strokeWidth="2">
                  <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
                  <path d="M36 18c0-9.94-8.06-18-18-18">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 18 18"
                      to="360 18 18"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              </g>
            </svg>
          </span>
        </form>
      </div>
    </div>
    <div class="ais-HierarchicalMenu-noResults">No results.</div>
  </div>
classes:
  - name: .ais-HierarchicalMenu
    description: the root div of the widget
  - name: .ais-HierarchicalMenu--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-HierarchicalMenu-searchBox
    description: the search box of the widget
  - name: .ais-HierarchicalMenu-list
    description: the list of menu items
  - name: .ais-HierarchicalMenu-list--child
    description: the child list of menu items
  - name: .ais-HierarchicalMenu-list--lvl0
    description: the level 0 list of menu items
  - name: .ais-HierarchicalMenu-list--lvl1
    description: the level 1 list of menu items (and so on)
  - name: .ais-HierarchicalMenu-item
    description: the menu list item
  - name: .ais-HierarchicalMenu-item--selected
    description: the selected menu list item
  - name: .ais-HierarchicalMenu-item--parent
    description: the menu list item containing children
  - name: .ais-HierarchicalMenu-link
    description: the clickable menu element
  - name: .ais-HierarchicalMenu-label
    description: the label of each item
  - name: .ais-HierarchicalMenu-count
    description: the count of values for each item
  - name: .ais-HierarchicalMenu-noResults
    description: the div displayed when there are no results
  - name: .ais-HierarchicalMenu-showMore
    description: the button used to display more categories
  - name: .ais-HierarchicalMenu-showMore--disabled
    description: the disabled button used to display more categories
options:
  - name: attributes
    description: Array of attributes to use to generate the breadcrumb
  - name: limit
    default: 10
    description: Number of items to show
  - name: showMoreLimit
    default: 20
    description: Number of items to show when the user clicked on "show more items"
  - name: showMore
    default: false
    description: Whether or not to have the option to load more values
---
