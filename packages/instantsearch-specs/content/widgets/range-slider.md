---
title: RangeSlider
type: widget
info: Each InstantSearch library provides a different way of creating a RangeSlider widget. InstantSearch.css provides a styling for the rheostat slider created by Airbnb (see example below).
html: |
  <div class="ais-RangeSlider">
    <div class="ais-RangeSlider-header ais-header">
      Range slider
    </div>
    <div class="ais-RangeSlider-body ais-body">
      <div class="rheostat rheostat-horizontal" style="position: relative;">
        <div class="rheostat-background"></div>
        <div class="rheostat-handle rehostat-handle--lower" aria-valuemax="5000" aria-valuemin="1" aria-valuenow="750" aria-disabled="false" data-handle-key="0" role="slider" tabindex="0" style="left: 15%; position: absolute;">
          <div class="rheostat-tooltip">$750</div>
        </div>
        <div class="rheostat-handle rheostat-handle--upper" aria-valuemax="5000" aria-valuemin="750" aria-valuenow="5000" aria-disabled="false" data-handle-key="1" role="slider" tabindex="0" style="left: 100%; position: absolute;">
          <div class="rheostat-tooltip">$5,000</div>
        </div>
        <div class="rheostat-progress" style="left: 15%; width: 85%;"></div>
        <div class="rheostat-marker rheostat-marker--lower" style="left: 0%; position: absolute; margin-left: 0px;">
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
        <div class="rheostat-marker rheostat-marker--large" style="left: 100%; position: absolute; margin-left: -2px;">
          <div class="rheostat-value">5,000</div>
        </div>
      </div>
    </div>
    <div class="ais-RangeSlider-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-RangeSlider
    description: the root div of the widget
  - name: .ais-RangeSlider-header
    description: the header of the widget (optional)
  - name: .ais-RangeSlider-body
    description: the body of the widget
  - name: .ais-RangeSlider-footer
    description: the footer of the widget (optional)
---
