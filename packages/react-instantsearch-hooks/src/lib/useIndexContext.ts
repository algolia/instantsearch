import { useContext } from 'react';

import { invariant } from '../lib/invariant';

import { IndexContext } from './IndexContext';

export function useIndexContext() {
  const context = useContext(IndexContext);

  invariant(
    context !== null,
    'The <Index> component must be used within <InstantSearch>.'
  );

  return context;
}
