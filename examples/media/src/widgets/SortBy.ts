import { sortBy as sortByWidget } from 'instantsearch.js/es/widgets';

export const sortBy = sortByWidget({
  container: '[data-widget="sort-by"]',
  items: [
    {
      label: 'Most relevant',
      value: 'instant_search_media',
    },
    {
      label: 'Engagement',
      value: 'instant_search_media_engagement_desc',
    },
  ],
});
