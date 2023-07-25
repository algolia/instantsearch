import { connectRelevantSort } from 'react-instantsearch-core';

import RelevantSort from '../components/RelevantSort';

export default connectRelevantSort(RelevantSort, {
  $$widgetType: 'ais.relevantSort',
});
