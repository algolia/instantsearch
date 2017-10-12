import { deprecate } from '../../lib/utils';
import connectRange from '../range/connectRange';

export default deprecate(
  connectRange,
  `'connectRangeSlider' was replaced by 'connectRange'.
  Please see https://community.algolia.com/instantsearch.js/v2/connectors/connectRange.html`
);
