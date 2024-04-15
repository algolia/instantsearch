---
layout: ../../layouts/WidgetLayout.astro
title: FrequentlyBoughtTogether
type: widget
html: |
  <div class="ais-FrequentlyBoughtTogether">
    <h3 class="ais-FrequentlyBoughtTogether-title">Frequently bought together</h3>
    <div class="ais-FrequentlyBoughtTogether-container">
      <ol class="ais-FrequentlyBoughtTogether-list">
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-FrequentlyBoughtTogether-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
      </ol>
    </div>
  </div>
classes:
  - name: .ais-FrequentlyBoughtTogether
    description: the root div of the widget
  - name: .ais-FrequentlyBoughtTogether-title
    description: the title heading of the widget
  - name: .ais-FrequentlyBoughtTogether-container
    description: the container for the list of results
  - name: .ais-FrequentlyBoughtTogether-list
    description: the list of results
  - name: .ais-FrequentlyBoughtTogether-item
    description: the hit list item
options:
  - name: objectID
    description: objectID of the item to get the frequently bought together items from
  - name: maxRecommendations
    description: Number of recommendations to retrieve
  - name: queryParameters
    description: List of search parameters to send
  - name: threshold
    description: Threshold for the recommendations confidence score (between 0 and 100)
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
translations:
  - name: title
    default: "Frequently bought together"
    description: The text for the header element
  - name: sliderLabel
    default: "Frequently bought together products"
    description: The label for the horizontal slider
---
