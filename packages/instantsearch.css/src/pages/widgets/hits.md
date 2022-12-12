---
layout: ../../layouts/WidgetLayout.astro
title: Hits
type: widget
html: |
  <div class="ais-Hits">
    <ol class="ais-Hits-list">
      <li class="ais-Hits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-Hits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-Hits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-Hits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-Hits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-Hits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
      <li class="ais-Hits-item">
        Hit 5477500: Amazon - Fire TV Stick with Alexa Voice Remote - Black
      </li>
      <li class="ais-Hits-item">
        Hit 4397400: Google - Chromecast - Black
      </li>
    </ol>
  </div>
classes:
  - name: .ais-Hits
    description: the root div of the widget
  - name: .ais-Hits-list
    description: the list of results
  - name: .ais-Hits-item
    description: the hit list item
options:
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
  - name: escapeHTML
    description: Escape raw HTML in the hits
---
