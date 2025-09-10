import React from 'react';

import { useIndexContext } from '../lib/useIndexContext';

import { Index } from './Index';

export type AutocompleteWrapperProps = {
  children: React.ReactNode;
};

export function EXPERIMENTAL_AutocompleteWrapper({
  children,
}: AutocompleteWrapperProps) {
  const parentIndex = useIndexContext();

  const parentIndexName = parentIndex.getIndexName();

  return (
    <Index
      indexName={parentIndex.getIndexName()}
      indexId={`${parentIndexName}-autocomplete`}
      EXPERIMENTAL_isolated
    >
      {children}
    </Index>
  );
}
