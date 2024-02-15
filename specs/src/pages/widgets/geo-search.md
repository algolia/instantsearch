---
layout: ../../layouts/WidgetLayout.astro
title: GeoSearch
type: widget
html: |
  <div class="ais-GeoSearch">
    <div class="ais-GeoSearch-map">
      <!-- Map element here -->
    </div>
    <div class="ais-GeoSearch-control">
      <label class="ais-GeoSearch-label">
        <input class="ais-GeoSearch-input" type="checkbox">
        Search as I move the map
      </label>
    </div>
    <button class="ais-GeoSearch-reset">
      Clear the map refinement
    </button>
  </div>
alt1: Search as I move the map disabled
althtml1: |
  <div class="ais-GeoSearch">
    <div class="ais-GeoSearch-map">
      <!-- Map element here -->
    </div>
    <div class="ais-GeoSearch-control">
      <button class="ais-GeoSearch-redo">
        Redo search here
      </button>
    </div>
    <button class="ais-GeoSearch-reset">
      Clear the map refinement
    </button>
  </div>
alt2: Control disabled
althtml2: |
  <div class="ais-GeoSearch">
    <div class="ais-GeoSearch-map">
      <!-- Map element here -->
    </div>
    <button class="ais-GeoSearch-reset">
      Clear the map refinement
    </button>
  </div>
classes:
  - name: .ais-GeoSearch
    description: the root div of the widget
  - name: .ais-GeoSearch-map
    description: the map container of the widget
  - name: .ais-GeoSearch-control
    description: the control element of the widget
  - name: .ais-GeoSearch-label
    description: the label of the control element
  - name: .ais-GeoSearch-label--selected
    description: the selected label of the control element
  - name: .ais-GeoSearch-input
    description: the input of the control element
  - name: .ais-GeoSearch-redo
    description: the redo search button
  - name: .ais-GeoSearch-redo--disabled
    description: the disabled redo search button
  - name: .ais-GeoSearch-reset
    description: the reset refinement button
options:
  - name: initialZoom
    default: 1
    description: Zoom of the map when no results are found
  - name: initialPosition
    default: '{ lat:0, lng:0 }'
    description: Position of the map when no results are found
  - name: paddingBoundingBox
    default: '{ top:0, right:0, bottom:0, left:0 }'
    description: Add an inner padding on the map when you refine
  - name: mapOptions
    default: '{}'
    description: Option forwarded to the Google Maps constructor
  - name: enableClearMapRefinement
    default: true
    description: Button displayed on the map when the refinement is coming from the map in order to remove it
  - name: enableRefineControl
    default: true
    description: The user can toggle the option `enableRefineOnMapMove` directly from the map
  - name: enableRefineOnMapMove
    default: true
    description: Refine will be triggered as you move the map
  - name: enableGeolocationWithIP
    default: true
    description: The IP will be use for the location, when `position` is provided this option is ignored
  - name: position
    description: Position that will be use to search around
  - name: radius
    description: Maximum radius to search around the position
  - name: precision
    description: Precision of geo search
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
translations:
  - name: resetButtonText
    default: 'Clear the map refinement'
    description: The text of the "Clear the map refinement" button.
  - name: redoButtonText
    default: 'Redo search here'
    description: The text of the button that's displayed when the map was moved.
  - name: refineOnMoveToggleLabel
    default: 'Search as I move the map'
    description: The label of the toggle to refine on move.
---
