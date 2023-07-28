import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-core';

import type { InstantSearchProps } from 'react-instantsearch-core';

const searchClient = createAlgoliaSearchClient({});

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

export function createInstantSearchTestWrapper(
  props?: Partial<InstantSearchProps>
) {
  const client = createAlgoliaSearchClient({});

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <InstantSearch searchClient={client} indexName="indexName" {...props}>
      {children}
    </InstantSearch>
  );

  return wrapper;
}
