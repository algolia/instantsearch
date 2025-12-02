'use client';

import Link from 'next/link';
import React from 'react';
import {
  Hits,
  SearchBox,
  RefinementList,
  DynamicWidgets,
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import { Hit } from '../components/Hit';
import { Panel } from '../components/Panel';
import { QueryId } from '../components/QueryId';
import { client } from '../lib/client';

export default function Search() {
  return (
    <InstantSearchNext
      searchClient={client}
      indexName="instant_search"
      routing
      insights={false}
    >
      <div className="Container">
        <div>
          <DynamicWidgets fallbackComponent={FallbackComponent} />
        </div>
        <div>
          <SearchBox />
          <Hits hitComponent={Hit} />
        </div>
      </div>
      <QueryId />
      <Link href="/layout" id="link">
        Other page
      </Link>
    </InstantSearchNext>
  );
}

function FallbackComponent({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}
