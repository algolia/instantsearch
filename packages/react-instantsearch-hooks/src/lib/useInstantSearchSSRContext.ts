import { useContext } from 'react';

import { InstantSearchSSRContext } from './InstantSearchSSRContext';

export function useInstantSearchSSRContext() {
  return useContext(InstantSearchSSRContext);
}
