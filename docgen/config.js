var algoliaComponents = require('algolia-frontend-components');
var fs = require('fs');

import {rootPath} from './path';
import pkg from '../package.json';

const prod = process.env.NODE_ENV === 'production';

var content = JSON.parse(fs.readFileSync('./src/data/communityHeader.json', 'utf8').toString());
var headerAlgoliaLogo = fs.readFileSync('assets/img/algolia-logo-darkbg.svg', 'utf8').toString();
var headerCommunityLogo = fs.readFileSync('assets/img/algolia-community-dark.svg', 'utf8').toString();
var header = algoliaComponents.communityHeader(content, {
	algoliaLogo: headerAlgoliaLogo,
	communityLogo: headerCommunityLogo
});

export default {
  docsDist:  rootPath('docs'),
  publicPath: prod ? '/instantsearch.js/' : '/',
  header: header,
  pkg
};
