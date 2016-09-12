/* eslint-disable no-console */

import ghpages from 'gh-pages';
import {join} from 'path';

const site = join(__dirname, '../docs');
const logger = msg => console.log(msg);
const end = err => {
  if (err) {
    throw err;
  }

  console.log('website published');
};

if (process.env.CI === 'true') {
  ghpages.publish(site, {
    repo: `https://${process.env.GH_TOKEN}@github.com/algolia/instantsearch.js.git`,
    logger,
  }, end);
} else {
  ghpages.publish(
    site, {
      logger,
      branch: 'test-gh-pages',
      src: 'react/',
      remove: 'react/',
    },
    end
  );
}
