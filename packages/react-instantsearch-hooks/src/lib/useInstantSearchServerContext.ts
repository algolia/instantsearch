import { useContext } from 'react';

import { InstantSearchServerContext } from '../components/InstantSearchServerContext';

export function useInstantSearchServerContext() {
  return useContext(InstantSearchServerContext);
}
