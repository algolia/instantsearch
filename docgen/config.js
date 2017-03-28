import pkg from '../package.json';
import {rootPath} from './path';

const configs = {
  production: {
    docsDist: rootPath('docs-production'),
    publicPath: '/instantsearch.js/',
  },
  development: {
    docsDist: rootPath('docs'),
    publicPath: '/',
  },
};

export default {...configs[process.env.NODE_ENV], pkg};
