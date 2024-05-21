---
layout: ../../layouts/WidgetLayout.astro
title: LookingSimilar
type: widget
html: |
  <div class="ais-LookingSimilar">
    <h3 class="ais-LookingSimilar-title">Looking Similar</h3>
    <div class="ais-LookingSimilar-container">
      <ol class="ais-LookingSimilar-list">
        <li class="ais-LookingSimilar-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-LookingSimilar-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-LookingSimilar-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-LookingSimilar-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-LookingSimilar-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-LookingSimilar-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-LookingSimilar-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-LookingSimilar-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
      </ol>
    </div>
  </div>
classes:
  - name: .ais-LookingSimilar
    description: the root div of the widget
  - name: .ais-LookingSimilar-title
    description: the title heading of the widget
  - name: .ais-LookingSimilar-container
    description: the container for the list of results
  - name: .ais-LookingSimilar-list
    description: the list of results
  - name: .ais-LookingSimilar-item
    description: the hit list item
options:
  - name: objectIDs
    description: objectIDs of the items to get the Looking Similar items from
  - name: limit
    description: Number of recommendations to retrieve
  - name: fallbackParameters
    description: List of search parameters to send as additional filters to use as fallback when there aren't enough recommendations.
  - name: queryParameters
    description: List of search parameters to send
  - name: threshold
    description: Threshold for the recommendations confidence score (between 0 and 100)
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
translations:
  - name: title
    default: "Looking Similar"
    description: The text for the header element
  - name: sliderLabel
    default: "Looking Similar"
    description: The label for the horizontal slider
---
