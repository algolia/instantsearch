import { configure } from '@storybook/react';
// import { withKnobs } from '@storybook/addon-knobs';
import { create } from '@storybook/theming';

// addParameters({
//   options: {
//     panelPosition: 'right',
//     theme: create({
//       base: 'light',
//       brandTitle: 'react-instantsearch',
//       brandUrl: 'https://github.com/algolia/instantsearch.js',
//     }),
//   },
// });


const req = require.context('../stories', true, /\.stories\.(js|ts|tsx)$/);

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
