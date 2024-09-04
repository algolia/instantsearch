---
layout: ../../layouts/WidgetLayout.astro
title: Breadcrumb
type: widget
html: |
  <div class="ais-Breadcrumb">
    <ul class="ais-Breadcrumb-list">
      <li class="ais-Breadcrumb-item">
        <a class="ais-Breadcrumb-link" href="#">Home</a>
      </li>
      <li class="ais-Breadcrumb-item">
        <span class="ais-Breadcrumb-separator" aria-hidden="true">></span>
        <a class="ais-Breadcrumb-link" href="#">Cooking</a>
      </li>
      <li class="ais-Breadcrumb-item ais-Breadcrumb-item--selected">
        <span class="ais-Breadcrumb-separator" aria-hidden="true">></span>
        Kitchen textiles
      </li>
    </ul>
  </div>
classes:
  - name: .ais-Breadcrumb
    description: the root div of the widget
  - name: .ais-Breadcrumb--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-Breadcrumb-list
    description: the list of all breadcrumb items
  - name: .ais-Breadcrumb-item
    description: the breadcrumb navigation item
  - name: .ais-Breadcrumb-item--selected
    description: the selected breadcrumb item
  - name: .ais-Breadcrumb-separator
    description: the separator of each breadcrumb item
  - name: .ais-Breadcrumb-link
    description: the clickable breadcrumb element
options:
  - name: attributes
    description: Array of attributes to use to generate the breadcrumb
  - name: separator
    default: '" > "'
    description: Separator used in the attributes to separate level values
  - name: rootPath
    description: Prefix path to use if the first level is not the root level.
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
translations:
  - name: rootElementText
    default: '"Home"'
    description: The text for the breadcrumb’s starting point (for example, “Home page”).
  - name: separatorText
    default: '" > "'
    description: The text for the breadcrumb’s separator.
examples:
  - flavor: js
    library: instantsearch.js
    code: |
      import { breadcrumb, hierarchicalMenu } from 'instantsearch.js/es/widgets';

      export const createWidgets = (createContainer) => [
        breadcrumb({
          container: createContainer(),
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),
        hierarchicalMenu({
          container: createContainer(),
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),
      ];
  - flavor: react
    library: react-instantsearch
    code: |
      import React from 'react';
      import { Breadcrumb, HierarchicalMenu } from 'react-instantsearch';

      export const widgets = (
        <>
          <Breadcrumb
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />
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
          <ais-breadcrumb
            :attributes="[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]"
          />
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
      import { AisBreadcrumb, AisHierarchicalMenu } from 'vue-instantsearch';

      export default {
        components: {
          AisBreadcrumb,
          AisHierarchicalMenu,
        },
      };
      </script>
---
