import { create } from '@storybook/theming';

// List of categories to sort the stories in the order of the InstantSearch.js
// API reference.
// See https://www.algolia.com/doc/api-reference/widgets/js/
const categories = [
  'Basics',
  'Results',
  'Refinements',
  'Pagination',
  'Metadata',
  'Sorting',
];

module.exports = {
  addons: ['@storybook/addon-actions'],
  babel: (options) => ({
    ...options,
    rootMode: 'upward',
  }),
  framework: '@storybook/html-vite',
  stories: ['../stories/*.stories.@(js|ts|tsx)'],
  storySort(a, b) {
    const categoryA = a[1].kind.split('|')[0];
    const categoryB = b[1].kind.split('|')[0];

    if (categories.indexOf(categoryA) === categories.indexOf(categoryB)) {
      return 0;
    }

    return categories.indexOf(categoryA) - categories.indexOf(categoryB);
  },
};
