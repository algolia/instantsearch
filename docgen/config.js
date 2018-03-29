// eslint-disable-next-line import/no-commonjs
const algoliaComponents = require('algolia-frontend-components');
// eslint-disable-next-line import/no-commonjs

import fs from 'fs';
import pkg from '../packages/react-instantsearch/package.json';
import { rootPath } from './path';

const ENV = process.env.NODE_ENV || 'development';

const content = JSON.parse(
  fs
    .readFileSync(rootPath('docgen/src/data/communityHeader.json'), 'utf8')
    .toString()
);

const headerAlgoliaLogo = fs
  .readFileSync(rootPath('docgen/assets/img/algolia-logo-whitebg.svg'), 'utf8')
  .toString();

const headerCommunityLogo = fs
  .readFileSync(
    rootPath('docgen/assets/img/algolia-community-dark.svg'),
    'utf8'
  )
  .toString();

const header = algoliaComponents.communityHeader(content, {
  algoliaLogo: headerAlgoliaLogo,
  communityLogo: headerCommunityLogo,
});

const configs = {
  production: {
    docsDist: rootPath('docgen/docs-production/react-instantsearch'),
    storyBookPublicPath: 'storybook/',
    publicPath: '/react-instantsearch/',
    header,
  },
  development: {
    docsDist: rootPath('docgen/docs-development/react-instantsearch'),
    storyBookPublicPath: 'http://localhost:6006/',
    publicPath: '/',
    header,
  },
};

export default { ...configs[ENV], pkg };
