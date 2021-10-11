import React from 'react';

import { IndexContext } from './IndexContext';
import { useIndex } from './useIndex';

import type { UseIndexProps } from './useIndex';

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
