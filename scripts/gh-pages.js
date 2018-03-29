/* eslint-disable no-console */

import ghpages from 'gh-pages';
import { join } from 'path';

ghpages.clean();

const site = join(__dirname, '../docgen/docs-production/react-instantsearch');
const logger = msg => console.log(msg);
const end = err => {
  if (err) {
    throw err;
  }

  console.log('website published');
};

const defaultOptions = {
  logger,
  silent: true,
  add: true,
};

ghpages.publish(site, defaultOptions, end);
