import { addDecorator, configure } from '@storybook/html';
import { withOptions } from '@storybook/addon-options';
import './style.css';

addDecorator(
  withOptions({
    name: 'instantsearch.js',
    url: 'https://github.com/algolia/instantsearch.js',
  })
);

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
