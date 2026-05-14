import { getAppIdAndApiKey } from 'instantsearch-core';

import { useInstantSearchContext } from './useInstantSearchContext';

export const useAppIdAndApiKey = () => {
  const { client } = useInstantSearchContext();

  return getAppIdAndApiKey(client);
};
