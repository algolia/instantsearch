import { refinementList as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const refinementList = defineWidget({
  name: 'refinementList',
  fn,
  slot: 'facet',
  defaults: [
    {
      key: 'attribute',
      label: "'categories'",
      value: { attribute: 'categories' },
    },
  ],
  toggles: [
    {
      key: 'searchable',
      label: 'true',
      value: { searchable: true },
    },
    {
      key: 'operator',
      label: "'and'",
      value: { operator: 'and' },
    },
    {
      key: 'showMore',
      label: 'true',
      value: { showMore: true, limit: 3, showMoreLimit: 10 },
    },
    {
      key: 'sortBy',
      label: "['isRefined', 'name:asc']",
      value: { sortBy: ['isRefined', 'name:asc'] },
    },
    {
      key: 'transformItems',
      label: 'uppercaseLabels',
      value: { transformItems: uppercaseLabels },
    },
    {
      key: 'searchablePlaceholder',
      label: "'Find a category…'",
      requires: 'searchable',
      value: { searchablePlaceholder: 'Find a category…' },
    },
    {
      key: 'searchableIsAlwaysActive',
      flavors: ['js'],
      label: 'false',
      requires: 'searchable',
      value: { searchableIsAlwaysActive: false },
    },
    {
      key: 'searchableEscapeFacetValues',
      flavors: ['js'],
      label: 'false',
      requires: 'searchable',
      value: { searchableEscapeFacetValues: false },
    },
    {
      key: 'searchableSelectOnSubmit',
      flavors: ['js', 'react'],
      label: 'false',
      requires: 'searchable',
      value: { searchableSelectOnSubmit: false },
    },
    {
      key: 'showMoreButtonLabel',
      flavors: ['js', 'vue'],
      label: "'More categories'",
      requires: 'showMore',
      value: { showMoreButtonLabel: 'More categories' },
    },
  ],
  // `escapeFacetValues` is omitted: it has no observable effect on this data.
});
