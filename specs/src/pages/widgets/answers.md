---
layout: ../../layouts/WidgetLayout.astro
title: Answers
type: widget
html: |
  <div class="ais-Answers">
    <div class="ais-Answers-header">Algolia Answers</div>
    <ul class="ais-Answers-list">
      <li class="ais-Answers-item">Author Sam Martin shares photos of ...</li>
      <li class="ais-Answers-item">Beau Lotto's color games puzzle your vision, but they also spotlight what you can't normally see...</li>
    </ul>
  </div>
alt1: empty
althtml1: |
  <div class="ais-Answers ais-Answers--empty">
    <div class="ais-Answers-header">Algolia Answers</div>
    <ul class="ais-Answers-list"></ul>
  </div>
alt2: loading
althtml2: |
  <div class="ais-Answers ais-Answers--empty">
    <div class="ais-Answers-header">Algolia Answers</div>
    <div class="ais-Answers-loader">loading...</div>
  </div>
classes:
  - name: .ais-Answers
    description: the root div of the widget
  - name: .ais-Answers--empty
    description: the root div of the widget with no items
  - name: .ais-Answers-header
    description: the header
  - name: .ais-Answers-loader
    description: the loader when it's loading
  - name: .ais-Answers-list
    description: the list of Answers result
  - name: .ais-Answers-item
    description: the list item
options:
  - name: queryLanguages
    description: The languages in the query. Currently only supports `en`.
  - name: attributesForPrediction
    description: |
      Attributes to use for prediction.
      If empty, we use all `searchableAttributes` to find answers.
      All your `attributesForPrediction` must be part of your `searchableAttributes`.
    default: "['*']"
  - name: nbHits
    description: |
      Maximum number of answers to retrieve from the Answers Engine.
      Cannot be greater than 1000.
    default: 1
  - name: debounceTime
    description: Debounce time in milliseconds before querying the answers API
    default: 200
  - name: escapeHTML
    description: Whether to escape HTML tags from hits string values.
    default: true
---
