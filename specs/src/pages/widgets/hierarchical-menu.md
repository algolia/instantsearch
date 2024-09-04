---
layout: ../../layouts/WidgetLayout.astro
title: HierarchicalMenu
type: widget
html: |
  <div class="ais-HierarchicalMenu">
    <div class="ais-HierarchicalMenu-searchBox">
      <!-- SearchBox widget here -->
    </div>
    <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0">
      <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected">
        <a class="ais-HierarchicalMenu-link ais-HierarchicalMenu-link--selected" href="#">
          <span class="ais-HierarchicalMenu-label">Appliances</span>
          <span class="ais-HierarchicalMenu-count">4,306</span>
        </a>
        <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child ais-HierarchicalMenu-list--lvl1">
          <li class="ais-HierarchicalMenu-item">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Dishwashers</span>
              <span class="ais-HierarchicalMenu-count">181</span>
            </a>
          </li>
          <li class="ais-HierarchicalMenu-item">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Fans</span>
              <span class="ais-HierarchicalMenu-count">91</span>
            </a>
          </li>
        </ul>
      </li>
      <li class="ais-HierarchicalMenu-item">
        <a class="ais-HierarchicalMenu-link" href="#">
          <span class="ais-HierarchicalMenu-label">Audio</span>
          <span class="ais-HierarchicalMenu-count">1,570</span>
        </a>
      </li>
    </ul>
    <button class="ais-HierarchicalMenu-showMore">Show more</button>
  </div>
alt1: Show more disabled
althtml1: |
  <div class="ais-HierarchicalMenu">
    <div class="ais-HierarchicalMenu-searchBox">
      <!-- SearchBox widget here -->
    </div>
    <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--lvl0">
      <li class="ais-HierarchicalMenu-item ais-HierarchicalMenu-item--parent ais-HierarchicalMenu-item--selected">
        <a class="ais-HierarchicalMenu-link ais-HierarchicalMenu-link--selected" href="#">
          <span class="ais-HierarchicalMenu-label">Appliances</span>
          <span class="ais-HierarchicalMenu-count">4,306</span>
        </a>
        <ul class="ais-HierarchicalMenu-list ais-HierarchicalMenu-list--child ais-HierarchicalMenu-list--lvl1">
          <li class="ais-HierarchicalMenu-item">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Dishwashers</span>
              <span class="ais-HierarchicalMenu-count">181</span>
            </a>
          </li>
          <li class="ais-HierarchicalMenu-item">
            <a class="ais-HierarchicalMenu-link" href="#">
              <span class="ais-HierarchicalMenu-label">Fans</span>
              <span class="ais-HierarchicalMenu-count">91</span>
            </a>
          </li>
        </ul>
      </li>
      <li class="ais-HierarchicalMenu-item">
        <a class="ais-HierarchicalMenu-link" href="#">
          <span class="ais-HierarchicalMenu-label">Audio</span>
          <span class="ais-HierarchicalMenu-count">1,570</span>
        </a>
      </li>
    </ul>
    <button class="ais-HierarchicalMenu-showMore ais-HierarchicalMenu-showMore--disabled" disabled>Show more</button>
  </div>
classes:
  - name: .ais-HierarchicalMenu
    description: the root div of the widget
  - name: .ais-HierarchicalMenu--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-HierarchicalMenu-searchBox
    description: the search box of the widget
  - name: .ais-HierarchicalMenu-list
    description: the list of menu items
  - name: .ais-HierarchicalMenu-list--child
    description: the child list of menu items
  - name: .ais-HierarchicalMenu-list--lvl0
    description: the level 0 list of menu items
  - name: .ais-HierarchicalMenu-list--lvl1
    description: the level 1 list of menu items (and so on)
  - name: .ais-HierarchicalMenu-item
    description: the menu list item
  - name: .ais-HierarchicalMenu-item--selected
    description: the selected menu list item
  - name: .ais-HierarchicalMenu-item--parent
    description: the menu list item containing children
  - name: .ais-HierarchicalMenu-link
    description: the clickable menu element
  - name: .ais-HierarchicalMenu-link--selected
    description: the clickable menu element of a selected menu list item
  - name: .ais-HierarchicalMenu-label
    description: the label of each item
  - name: .ais-HierarchicalMenu-count
    description: the count of values for each item
  - name: .ais-HierarchicalMenu-noResults
    description: the div displayed when there are no results
  - name: .ais-HierarchicalMenu-showMore
    description: the button used to display more categories
  - name: .ais-HierarchicalMenu-showMore--disabled
    description: the disabled button used to display more categories
options:
  - name: attributes
    description: Array of attributes to use to generate the breadcrumb
  - name: limit
    default: 10
    description: Number of items to show
  - name: showMoreLimit
    default: 20
    description: Number of items to show when the user clicked on "show more items"
  - name: showMore
    default: false
    description: Whether or not to have the option to load more values
  - name: separator
    default: '" > "'
    description: Separator used in the attributes to separate level values
  - name: rootPath
    description: Prefix path to use if the first level is not the root level.
  - name: showParentLevel
    default: true
    description: Show the siblings of the selected parent level of the current refined value. This does not impact the root level.
  - name: sortBy
    description: array or function to sort the results by
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
translations:
  - name: showMoreButtonText
    default: '({ isShowingMore }) => isShowingMore ? "Show less" : "Show more"'
    description: The text for the “Show more” button.
examples:
  - flavor: js
    library: instantsearch.js
    code: |
      import { hierarchicalMenu } from 'instantsearch.js/es/widgets';

      export const createWidgets = (createContainer) => [
        hierarchicalMenu({
          container: createContainer(),
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        })
      ];
  - flavor: react
    library: react-instantsearch
    code: |
      import React from 'react';
      import { HierarchicalMenu } from 'react-instantsearch';

      export const widgets = (
        <>
          <HierarchicalMenu
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />
        </>
      );
  - flavor: vue
    library: vue-instantsearch
    code: |
      <template>
        <div>
          <ais-hierarchical-menu
            :attributes="[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]"
          />
        </div>
      </template>

      <script>
      import { AisHierarchicalMenu } from 'vue-instantsearch';

      export default {
        components: {
          AisHierarchicalMenu,
        },
      };
      </script>
---
