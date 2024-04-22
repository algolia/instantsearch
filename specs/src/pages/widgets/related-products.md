---
layout: ../../layouts/WidgetLayout.astro
title: RelatedProducts
type: widget
html: |
  <div class="ais-RelatedProducts">
    <h3 class="ais-RelatedProducts-title">Related products</h3>
    <div class="ais-RelatedProducts-container">
      <ol class="ais-RelatedProducts-list">
        <li class="ais-RelatedProducts-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-RelatedProducts-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-RelatedProducts-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-RelatedProducts-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-RelatedProducts-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-RelatedProducts-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
        <li class="ais-RelatedProducts-item">
          Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
        </li>
        <li class="ais-RelatedProducts-item">
          Hit 4397400: Google - Chromecast - Black
        </li>
      </ol>
    </div>
  </div>
classes:
  - name: .ais-RelatedProducts
    description: the root div of the widget
  - name: .ais-RelatedProducts-title
    description: the title heading of the widget
  - name: .ais-RelatedProducts-container
    description: the container for the list of results
  - name: .ais-RelatedProducts-list
    description: the list of results
  - name: .ais-RelatedProducts-item
    description: the hit list item
options:
  - name: objectIDs
    description: objectIDs of the items to get the Related Products items from
  - name: maxRecommendations
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
    default: "Related products"
    description: The text for the header element
  - name: sliderLabel
    default: "Related products"
    description: The label for the horizontal slider
---
