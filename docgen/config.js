import pkg from '../packages/react-instantsearch/package.json';
import {rootPath} from './path';

const prod = process.env.NODE_ENV === 'production';

export default {
  docsDist: rootPath('docs/react'),
  storyBookPublicPath: prod ?
    'https://community.algolia.com/instantsearch.js/react/storybook/' :
    'http://localhost:6006/',
  publicPath: prod ?
    'https://community.algolia.com/instantsearch.js/react/' :
    '/',
  pkg,
};
