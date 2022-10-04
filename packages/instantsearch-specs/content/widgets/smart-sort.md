---
title: RelevantSort
type: widget
html: |
  <div class="ais-RelevantSort">
    <div class="ais-RelevantSort-text">
      We removed some search results to show you the most relevant ones
    </div>
    <button class="ais-RelevantSort-button">
      <span>See all results</span>
    </button>
  </div>
alt1: not smart sorted
althtml1: |
  <div class="ais-RelevantSort">
    <div class="ais-RelevantSort-text">
      Currently showing all results
    </div>
    <button class="ais-RelevantSort-button">
      <span>See relevant results</span>
    </button>
  </div>
classes:
  - name: .ais-RelevantSort
    description: the root span of the widget
  - name: .ais-RelevantSort-text
    description: the informative text
  - name: .ais-RelevantSort-button
    description: the button text
translations:
  - name: informationText
    default: '({ isRelevantSorted, isVirtualReplica }) => ""'
    description: Information text displayed above the button.
  - name: seeButtonText
    default: '({ isRelevantSorted, isVirtualReplica }) => isRelevantSorted ? "See all results" : "See relevant results"'
    description: The text of the "See _n_ results" button.
---
