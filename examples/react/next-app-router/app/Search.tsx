'use client';

import Link from 'next/link';
import React from 'react';
import {
  Chat,
  ChatPageSuggestions,
  Hits,
  SearchBox,
  RefinementList,
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import { Hit } from '../components/Hit';
import { Panel } from '../components/Panel';
import { QueryId } from '../components/QueryId';
import { client } from '../lib/client';

const isServer = typeof window === 'undefined';
const PHASE = isServer ? '[SSR]' : '[CSR]';

console.log(
  `${PHASE} Search.tsx module evaluated at ${new Date().toISOString()}`
);

export default function Search({ baseUrl }: { baseUrl: string }) {
  return (
    <InstantSearchNext
      searchClient={client}
      indexName="instant_search"
      routing
      insights={false}
    >
      <div className="Container">
        <div>
          <Panel header="brand">
            <RefinementList attribute="brand" />
          </Panel>
          <Panel header="categories">
            <RefinementList attribute="categories" />
          </Panel>
        </div>
        <div>
          <SearchBox />
          <Panel header="Prompt pills (SSR test)">
            {/*
              Demo wiring:
              - `?delay=500` on the dummy endpoint
              - `ssrTimeoutMs={1500}` → SSR wins the race and bakes pills into
                server HTML (curl the page and grep for one).
              - On client refinement changes, the 500ms delay makes the
                skeleton visible during the refetch.
              Flip `delay` higher than `ssrTimeoutMs` to test the SSR-timeout
              path (server HTML has no pills; client renders the skeleton
              then the pills after hydration).
            */}
            <ChatPageSuggestions
              maxSuggestions={4}
              ssrTimeoutMs={1500}
              transport={{
                api: `${baseUrl}/api/chat-page-suggestions?delay=500`,
              }}
            />
          </Panel>
          <Hits hitComponent={Hit} />
        </div>
      </div>
      <QueryId />
      <Link href="/layout" id="link">
        Other page
      </Link>

      <Chat agentId="eedef238-5468-470d-bc37-f99fa741bd25" feedback={true} />
    </InstantSearchNext>
  );
}
