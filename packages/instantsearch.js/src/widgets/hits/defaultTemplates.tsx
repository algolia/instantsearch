/** @jsx h */

import { h, Fragment } from 'preact';

import { omit } from '../../lib/utils';

// false positive lint error
// eslint-disable-next-line typescript/consistent-type-imports
import type { HitsTemplates } from './hits';

const defaultTemplates = {
  empty() {
    return 'No results';
  },
  item(data) {
    return (
      <Fragment>{JSON.stringify(omit(data, ['__hitIndex']), null, 2)}</Fragment>
    );
  },
} satisfies HitsTemplates;

export default defaultTemplates;
