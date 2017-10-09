// eslint-disable-next-line import/no-commonjs
const algoliaComponents = require('algolia-frontend-components');
// eslint-disable-next-line import/no-commonjs
const fs = require('fs');

import pkg from '../packages/react-instantsearch/package.json';
import { rootPath } from './path';

const content = JSON.parse(
  fs.readFileSync('./docgen/src/data/communityHeader.json', 'utf8').toString()
);
const headerAlgoliaLogo = fs
  .readFileSync('./docgen/assets/img/algolia-logo-whitebg.svg', 'utf8')
  .toString();
const headerCommunityLogo = fs
  .readFileSync('./docgen/assets/img/algolia-community-dark.svg', 'utf8')
  .toString();
const header = algoliaComponents.communityHeader(content, {
  algoliaLogo: headerAlgoliaLogo,
  communityLogo: headerCommunityLogo,
});

const configs = {
  production: {
    docsDist: rootPath('docs-production/react-instantsearch'),
    storyBookPublicPath: 'storybook/',
    publicPath: '/react-instantsearch/',
    header,
  },
  development: {
    docsDist: rootPath('docs/react-instantsearch'),
    storyBookPublicPath: 'http://localhost:6006/',
    publicPath: '/',
    header,
  },
};

export default { ...configs[process.env.NODE_ENV], pkg };
