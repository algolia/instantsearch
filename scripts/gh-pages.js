/* eslint-disable no-console */

import ghpages from 'gh-pages';
import {join} from 'path';

ghpages.clean();

const site = join(__dirname, '../docs-production');
const logger = msg => console.log(msg);
const end = err => {
  if (err) {
    throw err;
  }

  console.log('website published');
};

const defaultOptions = {
  logger,
  src: 'react/**/*', // everything in react/
  only: 'react/', // only remove what's in react/, keep other untouched (leave V1 doc)
};

// On travis
if (
  process.env.CI === 'true' &&
  process.env.TRAVIS_PULL_REQUEST === 'false' &&
  process.env.TRAVIS_BRANCH === 'v2'
) {
  ghpages.publish(site, {
    ...defaultOptions,
    repo: `https://${process.env.GH_TOKEN}@github.com/algolia/instantsearch.js.git`,
  }, end);
} else if (process.env.CI === undefined) { // dev mode
  ghpages.publish(site, defaultOptions, end);
} else { // in a pull request or not the right branch
  console.log('Not need to push documentation');
}
