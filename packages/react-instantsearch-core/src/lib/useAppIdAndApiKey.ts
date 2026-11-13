import { getAppIdAndApiKey } from 'instantsearch-core/internal';

import { useInstantSearchContext } from './useInstantSearchContext';

export const useAppIdAndApiKey = () => {
  const { client } = useInstantSearchContext();

  return getAppIdAndApiKey(client);
};
