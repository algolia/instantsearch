var algoliaComponents = require('algolia-frontend-components');
var fs = require('fs');

import {rootPath} from './path';

const prod = process.env.NODE_ENV === 'production';

var content = JSON.parse(fs.readFileSync('./src/data/communityHeader.json', 'utf8').toString());
var header = algoliaComponents.communityHeader(content);

export default {
  docsDist:  rootPath('docs'),
  publicPath: prod ? '/instantsearch.js/v2/' : '/',
  header: header
};
