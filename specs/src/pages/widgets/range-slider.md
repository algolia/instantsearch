---
layout: ../../layouts/WidgetLayout.astro
title: RangeSlider
type: widget
info: Each InstantSearch library provides a different way of creating a RangeSlider widget. InstantSearch.css provides a styling for the rheostat slider created by Airbnb (see example below).
html: |
  <div class="ais-RangeSlider">
    <div class="rheostat rheostat-horizontal" style="position: relative;">
      <div class="rheostat-background"></div>
      <div class="rheostat-handle rehostat-handle--lower" aria-valuemax="5000" aria-valuemin="1" aria-valuenow="750" aria-disabled="false" data-handle-key="0" role="slider" tabindex="0" style="left: 15%; position: absolute;" aria-label="Minimum Filter Handle">
        <div class="rheostat-tooltip">$750</div>
      </div>
      <div class="rheostat-handle rheostat-handle--upper" aria-valuemax="5000" aria-valuemin="750" aria-valuenow="5000" aria-disabled="false" data-handle-key="1" role="slider" tabindex="0" style="left: 100%; position: absolute;" aria-label="Maximum Filter Handle">
        <div class="rheostat-tooltip">$5,000</div>
      </div>
      <div class="rheostat-progress" style="left: 15%; width: 85%;"></div>
      <div class="rheostat-marker rheostat-marker--large" style="left: 0%; position: absolute; margin-left: 0px;">
        <div class="rheostat-value">1</div>
      </div>
      <div class="rheostat-marker" style="left: 2.94118%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 5.88235%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 8.82353%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 11.7647%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 14.7059%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 17.6471%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 20.5882%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 23.5294%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 26.4706%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 29.4118%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 32.3529%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 35.2941%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 38.2353%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 41.1765%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 44.1176%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 47.0588%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker rheostat-marker--large" style="left: 50%; position: absolute; margin-left: 0px;">
        <div class="rheostat-value">2,500</div>
      </div>
      <div class="rheostat-marker" style="left: 52.9412%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 55.8824%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 58.8235%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 61.7647%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 64.7059%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 67.6471%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 70.5882%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 73.5294%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 76.4706%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 79.4118%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 82.3529%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 85.2941%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 88.2353%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 91.1765%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 94.1176%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker" style="left: 97.0588%; position: absolute; margin-left: 0px;"></div>
      <div class="rheostat-marker rheostat-marker--large" style="left: 100%; position: absolute; margin-left: -1px;">
        <div class="rheostat-value">5,000</div>
      </div>
    </div>
  </div>
classes:
  - name: .ais-RangeSlider
    description: the root div of the widget
  - name: .ais-RangeSlider--disabled
    description: the root div of the widget when disabled
  - name: .ais-RangeSlider-handle
    description: the handle div of the widget
  - name: .ais-RangeSlider-handle--lower
    description: the lower handle div of the widget
  - name: .ais-RangeSlider-handle--upper
    description: the upper handle div of the widget
  - name: .ais-RangeSlider-tooltip
    description: the tooltip div of the widget
  - name: .ais-RangeSlider-marker
    description: the marker div of the widget
  - name: .ais-RangeSlider-marker-horizontal
    description: the horizontal marker div of the widget
  - name: .ais-RangeSlider-marker--large
    description: the large marker div of the widget
  - name: .ais-RangeSlider-value
    description: the value div of the widget
options:
  - name: attribute
    description: Attribute to apply the filter to
  - name: min
    description: Minimum value. When this isn’t set, the minimum value will be automatically computed by Algolia using the data in the index.
  - name: max
    description: Maximum value. When this isn’t set, the maximum value will be automatically computed by Algolia using the data in the index.
  - name: precision
    default: 0
    description: Number of digits after decimal point to use.
---
