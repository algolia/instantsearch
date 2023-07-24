import React from 'react';

import { createClassNames } from '../core/utils';

import Highlighter from './Highlighter';

const cx = createClassNames('Highlight');

const Highlight = (props) => (
  <Highlighter {...props} highlightProperty="_highlightResult" cx={cx} />
);

export default Highlight;
