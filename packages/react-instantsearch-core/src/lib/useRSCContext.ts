import { useContext } from 'react';

import { InstantSearchRSCContext } from './InstantSearchRSCContext';

export function useRSCContext() {
  return useContext(InstantSearchRSCContext);
}
