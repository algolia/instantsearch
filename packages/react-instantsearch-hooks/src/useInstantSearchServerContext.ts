import { useContext } from 'react';

import { InstantSearchServerContext } from './InstantSearchServerContext';

export function useInstantSearchServerContext() {
  return useContext(InstantSearchServerContext);
}
