'use client';

import React from 'react';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import { client } from '../../lib/client';

export function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <InstantSearchNext
      searchClient={client}
      indexName="instant_search"
      routing
      insights={false}
    >
      {children}
    </InstantSearchNext>
  );
}
