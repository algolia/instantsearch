import { addParameters, configure } from '@storybook/html';
import { create } from '@storybook/theming';

addParameters({
  options: {
    theme: create({
      base: 'light',
      brandTitle: 'InstantSearch.js',
      brandUrl: 'https://github.com/algolia/instantsearch.js',
    }),
  },
});

const req = require.context('../stories', true, /.stories.(js|ts|tsx)$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
