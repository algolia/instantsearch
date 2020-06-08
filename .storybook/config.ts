import { addParameters, configure } from '@storybook/html';
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

addParameters({
  options: {
    showRoots: true,
    theme: create({
      base: 'light',
      brandTitle: 'InstantSearch.js',
      brandUrl: 'https://github.com/algolia/instantsearch.js',
    }),
    panelPosition: 'bottom',
    storySort(a: any[], b: any[]) {
      const categoryA = a[1].kind.split('|')[0];
      const categoryB = b[1].kind.split('|')[0];

      if (categories.indexOf(categoryA) === categories.indexOf(categoryB)) {
        return 0;
      }

      return categories.indexOf(categoryA) - categories.indexOf(categoryB);
    },
  },
});

const req = require.context('../stories', true, /.stories.(js|ts|tsx)$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
