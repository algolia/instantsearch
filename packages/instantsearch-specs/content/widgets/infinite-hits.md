---
title: InfiniteHits
type: widget
html: |
  <div class="ais-InfiniteHits">
    <ol class="ais-InfiniteHits-list">
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
    </ol>
    <button class="ais-InfiniteHits-loadMore">Show more results</button>
  </div>
alt1: Show previous enabled
althtml1: |
  <div class="ais-InfiniteHits">
    <button class="ais-InfiniteHits-loadPrevious">Show previous results</button>
    <ul class="ais-InfiniteHits-list">
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
    </ul>
    <button class="ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled" disabled>Show more results</button>
  </div>
alt2: Show previous and show more disabled
althtml2: |
  <div class="ais-InfiniteHits">
    <button class="ais-InfiniteHits-loadPrevious ais-InfiniteHits-loadPrevious--disabled" disabled>Show previous results</button>
    <ul class="ais-InfiniteHits-list">
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-InfiniteHits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
    </ul>
    <button class="ais-InfiniteHits-loadMore ais-InfiniteHits-loadMore--disabled" disabled>Show more results</button>
  </div>
classes:
  - name: .ais-InfiniteHits
    description: the root div of the widget
  - name: .ais-InfiniteHits-list
    description: the list of hits
  - name: .ais-InfiniteHits-item
    description: the hit list item
  - name: .ais-InfiniteHits-loadPrevious
    description: the button used to display previous results
  - name: .ais-InfiniteHits-loadPrevious--disabled
    description: the disabled button used to display previous results
  - name: .ais-InfiniteHits-loadMore
    description: the button used to display more results
  - name: .ais-InfiniteHits-loadMore--disabled
    description: the disabled button used to display more results
options:
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
  - name: escapeHTML
    description: Escape raw HTML in the hits
translations:
  - name: showPreviousButtonText
    default: '"Load previous page"'
    description: The text for the “Show previous” button.
  - name: showMoreButtonText
    default: '"Load next page"'
    description: The text for the “Show more” button.
---
