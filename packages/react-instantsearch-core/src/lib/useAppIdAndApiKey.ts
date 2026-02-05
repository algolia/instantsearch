import { getAppIdAndApiKey } from 'instantsearch.js/es/lib/utils';

import { useInstantSearchContext } from './useInstantSearchContext';

export const useAppIdAndApiKey = () => {
  const { client } = useInstantSearchContext();

  return getAppIdAndApiKey(client);
};
