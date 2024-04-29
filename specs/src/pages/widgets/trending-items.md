---
layout: ../../layouts/WidgetLayout.astro
title: TrendingItems
type: widget
html: |
  <div class="ais-TrendingItems">
    <h3 class="ais-TrendingItems-title">Trending items</h3>
    <div class="ais-TrendingItems-container">
      <ol class="ais-TrendingItems-list">
        <li class="ais-TrendingItems-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-TrendingItems-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-TrendingItems-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-TrendingItems-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-TrendingItems-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-TrendingItems-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-TrendingItems-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-TrendingItems-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
      </ol>
    </div>
  </div>
classes:
  - name: .ais-TrendingItems
    description: the root div of the widget
  - name: .ais-TrendingItems-title
    description: the title heading of the widget
  - name: .ais-TrendingItems-container
    description: the container for the list of results
  - name: .ais-TrendingItems-list
    description: the list of results
  - name: .ais-TrendingItems-item
    description: the hit list item
options:
  - name: objectIDs
    description: objectIDs of the items to get the Trending Items from
  - name: maxRecommendations
    description: Number of recommendations to retrieve
  - name: fallbackParameters
    description: List of search parameters to send as additional filters to use as fallback when there aren't enough recommendations.
  - name: queryParameters
    description: List of search parameters to send
  - name: threshold
    description: Threshold for the recommendations confidence score (between 0 and 100)
  - name: facetName
    description: Facet attribute to get recommendations for.
  - name: facetValue
    description: Value of the targeted facet attribute.
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
translations:
  - name: title
    default: "Trending items"
    description: The text for the header element
  - name: sliderLabel
    default: "Trending items"
    description: The label for the horizontal slider
---
