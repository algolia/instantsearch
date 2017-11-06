---
title: StarRating
type: widget
html: |
  <div class="ais-StarRating">
    <div class="ais-StarRating-header ais-header">
      Star rating
    </div>
    <div class="ais-StarRating-body ais-body">
      <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
        <symbol id="ais-StarRating-starSymbol" viewBox="0 0 24 24"><path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"/></symbol>
        <symbol id="ais-StarRating-starEmptySymbol" viewBox="0 0 24 24" width="24" height="24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></symbol>
      </svg>
      <ul class="ais-StarRating-list">
        <li class="ais-StarRating-item ais-StarRating-item--selected">
          <button class="ais-StarRating-button" aria-label="4 stars & up">
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starSymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starSymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starSymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starSymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starEmptySymbol"></use></svg>
            <span class="ais-StarRating-label" aria-hidden="true">& Up</span>
            <span class="ais-StarRating-count">2,300</span>
          </button>
        </li>
        <li class="ais-StarRating-item">
          <button class="ais-StarRating-button" aria-label="3 stars & up">
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starSymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starSymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starSymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starEmptySymbol"></use></svg>
            <svg class="ais-StarRating-starIcon" aria-hidden="true" width="24" height="24"><use xlink:href="#ais-StarRating-starEmptySymbol"></use></svg>
            <span class="ais-StarRating-label" aria-hidden="true">& Up</span>
            <span class="ais-StarRating-count">1,750</span>
          </button>
        </li>
      </ul>
    </div>
    <div class="ais-StarRating-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-StarRating
    description: the root div of the widget
  - name: .ais-StarRating-header
    description: the header of the widget (optional)
  - name: .ais-StarRating-body
    description: the body of the widget
  - name: .ais-StarRating-list
    description: the list of ratings
  - name: .ais-StarRating-item
    description: the rating list item
  - name: .ais-StarRating-item--selected
    description: the selected rating list item
  - name: .ais-StarRating-button
    description: the rating clickable item
  - name: .ais-StarRating-starIcon
    description: the star icon
  - name: .ais-StarRating-label
    description: the label used after the stars
  - name: .ais-StarRating-count
    description: the count of ratings for a specific item
  - name: .ais-StarRating-footer
    description: the footer of the widget (optional)
---
