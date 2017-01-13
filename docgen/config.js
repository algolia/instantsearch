import pkg from '../packages/react-instantsearch/package.json';
import {rootPath} from './path';

const configs = {
  production: {
    docsDist: rootPath('docs-production/react'),
    storyBookPublicPath: '/react/storybook/',
    publicPath: '/react/',
  },
  development: {
    docsDist: rootPath('docs/react'),
    storyBookPublicPath: 'http://localhost:6006/',
    publicPath: '/',
  },
};

export default {...configs[process.env.NODE_ENV], pkg};
