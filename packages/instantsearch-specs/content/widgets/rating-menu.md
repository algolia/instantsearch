---
title: RatingMenu
type: widget
html: |
  <div class="ais-RatingMenu">
    <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
      <symbol id="ais-RatingMenu-starSymbol" viewBox="0 0 24 24"><path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"/></symbol>
      <symbol id="ais-RatingMenu-starEmptySymbol" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></symbol>
    </svg>
    <ul class="ais-RatingMenu-list">
      <li class="ais-RatingMenu-item ais-RatingMenu-item--disabled">
        <div class="ais-RatingMenu-link" aria-label="5 & up" disabled>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <span class="ais-RatingMenu-label" aria-hidden="true">& Up</span>
          <span class="ais-RatingMenu-count">2,300</span>
        </div>
      </li>
      <li class="ais-RatingMenu-item ais-RatingMenu-item--selected">
        <a class="ais-RatingMenu-link" aria-label="4 & up" href="#">
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starEmptySymbol"></use></svg>
          <span class="ais-RatingMenu-label" aria-hidden="true">& Up</span>
          <span class="ais-RatingMenu-count">2,300</span>
        </a>
      </li>
      <li class="ais-RatingMenu-item">
        <a class="ais-RatingMenu-link" aria-label="3 & up" href="#">
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starSymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starEmptySymbol"></use></svg>
          <svg class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-RatingMenu-starEmptySymbol"></use></svg>
          <span class="ais-RatingMenu-label" aria-hidden="true">& Up</span>
          <span class="ais-RatingMenu-count">1,750</span>
        </a>
      </li>
    </ul>
  </div>
classes:
  - name: .ais-RatingMenu
    description: the root div of the widget
  - name: .ais-RatingMenu--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-RatingMenu-list
    description: the list of ratings
  - name: .ais-RatingMenu-item
    description: the rating list item
  - name: .ais-RatingMenu-item--selected
    description: the selected rating list item
  - name: .ais-RatingMenu-item--disabled
    description: the disabled rating list item
  - name: .ais-RatingMenu-link
    description: the rating clickable item
  - name: .ais-RatingMenu-starIcon--full
    description: the filled star icon
  - name: .ais-RatingMenu-starIcon--empty
    description: the empty star icon
  - name: .ais-RatingMenu-starIcon
    description: the star icon
  - name: .ais-RatingMenu-label
    description: the label used after the stars
  - name: .ais-RatingMenu-count
    description: the count of ratings for a specific item
---
