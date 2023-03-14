---
layout: ../../layouts/WidgetLayout.astro
title: RefinementList
type: widget
html: |
  <div class="ais-RefinementList">
    <div class="ais-RefinementList-searchBox">
      <!-- SearchBox widget here -->
    </div>
    <ul class="ais-RefinementList-list">
      <li class="ais-RefinementList-item ais-RefinementList-item--selected">
        <label class="ais-RefinementList-label">
          <input class="ais-RefinementList-checkbox" type="checkbox" value="Insignia™" checked="" />
          <span class="ais-RefinementList-labelText">Insignia™</span>
          <span class="ais-RefinementList-count">746</span>
        </label>
      </li>
      <li class="ais-RefinementList-item">
        <label class="ais-RefinementList-label">
          <input class="ais-RefinementList-checkbox" type="checkbox" value="Samsung">
          <span class="ais-RefinementList-labelText">Samsung</span>
          <span class="ais-RefinementList-count">633</span>
        </label>
      </li>
    </ul>
    <button class="ais-RefinementList-showMore">Show more</button>
  </div>
alt1: Show more disabled
althtml1: |
  <div class="ais-RefinementList">
    <div class="ais-RefinementList-searchBox">
      <!-- SearchBox widget here -->
    </div>
    <ul class="ais-RefinementList-list">
      <li class="ais-RefinementList-item ais-RefinementList-item--selected">
        <label class="ais-RefinementList-label">
          <input class="ais-RefinementList-checkbox" type="checkbox" value="Insignia™" checked="" />
          <span class="ais-RefinementList-labelText">Insignia™</span>
          <span class="ais-RefinementList-count">746</span>
        </label>
      </li>
      <li class="ais-RefinementList-item">
        <label class="ais-RefinementList-label">
          <input class="ais-RefinementList-checkbox" type="checkbox" value="Samsung">
          <span class="ais-RefinementList-labelText">Samsung</span>
          <span class="ais-RefinementList-count">633</span>
        </label>
      </li>
    </ul>
    <button class="ais-RefinementList-showMore ais-RefinementList-showMore--disabled" disabled>Show more</button>
  </div>
alt2: With search and no results
althtml2: |
  <div class="ais-RefinementList">
    <div class="ais-RefinementList-searchBox">
      <div class="ais-SearchBox">
        <form class="ais-SearchBox-form" novalidate>
          <input class="ais-SearchBox-input" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Search for products" spellcheck="false" maxlength="512" type="search" value="" />
          <button class="ais-SearchBox-submit" type="submit" title="Submit the search query.">
            <svg class="ais-SearchBox-submitIcon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 40 40" aria-hidden="true">
              <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
            </svg>
          </button>
          <button class="ais-SearchBox-reset" type="reset" title="Clear the search query." hidden>
            <svg class="ais-SearchBox-resetIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="10" height="10" aria-hidden="true">
              <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
            </svg>
          </button>
          <span class="ais-SearchBox-loadingIndicator" hidden>
            <svg width="16" height="16" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444" class="ais-SearchBox-loadingIcon" aria-hidden="true">
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
    <div class="ais-RefinementList-noResults">No results.</div>
  </div>
classes:
  - name: .ais-RefinementList
    description: the root div of the widget
  - name: .ais-RefinementList--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-RefinementList-searchBox
    description: the search box of the widget
  - name: .ais-RefinementList-list
    description: the list of refinement items
  - name: .ais-RefinementList-item
    description: the refinement list item
  - name: .ais-RefinementList-item--selected
    description: the refinement selected list item
  - name: .ais-RefinementList-label
    description: the label of each refinement item
  - name: .ais-RefinementList-checkbox
    description: the checkbox input of each refinement item
  - name: .ais-RefinementList-labelText
    description: the label text of each refinement item
  - name: .ais-RefinementList-count
    description: the count of values for each item
  - name: .ais-RefinementList-noResults
    description: the div displayed when there are no results
  - name: .ais-RefinementList-showMore
    description: the button used to display more categories
  - name: .ais-RefinementList-showMore--disabled
    description: the disabled button used to display more categories
options:
  - name: attribute
    description: Attribute to apply the filter to
  - name: searchable
    default: false
    description: Whether to add a search box to refine this list
  - name: operator
    default: '"or"'
    description: "How to apply refinements. Possible values: or, and"
  - name: limit
    default: 10
    description: Number of items to show
  - name: showMoreLimit
    default: 20
    description: Number of items to show when the user clicked on "show more items"
  - name: showMore
    default: false
    description: Whether or not to have the option to load more values
  - name: sortBy
    description: array or function to sort the results by
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
translations:
  - name: resetButtonTitle
    default: '"Clear the search query"'
    description: The submit button title of the search box.
  - name: submitButtonTitle
    default: '"Submit the search query"'
    description: The reset button title of the search box.
  - name: noResultsText
    default: '"No results."'
    description: The text to display when searching for facets returns no results.
  - name: showMoreButtonText
    default: '({ isShowingMore }) => isShowingMore ? "Show less" : "Show more"'
    description: The text for the “Show more” button.
---
