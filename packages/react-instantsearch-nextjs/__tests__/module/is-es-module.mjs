/* eslint-disable no-process-exit */
/* eslint-disable no-console */
import assert from 'assert';

import 'next';
import * as ReactInstantSearchSSRNext from 'react-instantsearch-nextjs';

assert.ok(ReactInstantSearchSSRNext);

console.log('react-instantsearch-nextjs is valid ESM');

process.exit(0);
