import { addDecorator, configure } from '@storybook/html';
import { withOptions } from '@storybook/addon-options';
import './style.css';

addDecorator(
  withOptions({
    name: 'instantsearch.js',
    url: 'https://github.com/algolia/instantsearch.js',
  })
);

const req = require.context('../stories', true, /.stories.(js|ts|tsx)$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
