import React from 'react';

import { IndexContext } from '../lib/IndexContext';
import { useIndex } from '../lib/useIndex';

import type { UseIndexProps } from '../lib/useIndex';

export type IndexProps = UseIndexProps & {
  children?: React.ReactNode;
};

export function Index({ children, ...props }: IndexProps) {
  const index = useIndex(props);

  if (index.getHelper() === null) {
    return null;
  }

  return (
    <IndexContext.Provider value={index}>{children}</IndexContext.Provider>
  );
}
