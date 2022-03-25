import React from 'react';
import { InstantSearch } from 'react-instantsearch-hooks';

import { createSearchClient } from '../mock';

import type { InstantSearchProps } from 'react-instantsearch-hooks';

const searchClient = createSearchClient({});

type InstantSearchHooksTestWrapperProps = {
  children: React.ReactNode;
} & Partial<InstantSearchProps>;

export function InstantSearchHooksTestWrapper({
  children,
  ...props
}: InstantSearchHooksTestWrapperProps) {
  return (
    <InstantSearch searchClient={searchClient} indexName="indexName" {...props}>
      {children}
    </InstantSearch>
  );
}
