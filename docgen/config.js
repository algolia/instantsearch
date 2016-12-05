import pkg from '../packages/react-instantsearch/package.json';
import {rootPath} from './path';

const prod = process.env.NODE_ENV === 'production';

export default {
  docsDist: rootPath('docs/react'),
  publicPath: prod ?
    'https://community.algolia.com/instantsearch.js/react/' :
    '/',
  pkg,
};
