'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
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
          <Panel header="brand">
            <RefinementList attribute="brand" />
          </Panel>
          <Panel header="categories">
            <RefinementList attribute="categories" />
          </Panel>
        </div>
        <div>
          <SearchBox />
          <Panel header="Page suggestion (SSR test)">
            <PageSuggestionsPanel />
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

function PageSuggestionsPanel() {
  // Keep both context + prompt stable across renders. Fresh function/string
  // refs would make `useStableValue` in `useConnector` consider the widget
  // props changed on every InstantSearch `render` event, which would tear
  // down and re-init the widget (and its Chat instance) on every render.
  const stableContextRef = useRef(() => ({}));
  const stablePromptRef = useRef('give me some tvs');

  useEffect(() => {
    console.log(
      `${PHASE} PageSuggestionsPanel mounted (client hydration) at ${new Date().toISOString()}`
    );
  }, []);

  // Logged on both server and client renders.
  console.log(
    `${PHASE} PageSuggestionsPanel rendering at ${new Date().toISOString()}`
  );

  return (
    <ChatPageSuggestions
      agentId="eedef238-5468-470d-bc37-f99fa741bd25"
      initialUserMessage={stablePromptRef.current}
      context={stableContextRef.current}
      ssrTimeoutMs={200}
      ctaLabel="Continue in chat"
      // itemComponent={({ item }) => (
      //   <article className="ais-Carousel-hit">
      //     <div className="ais-Carousel-hit-image">
      //       <img src={(item as any).image} alt={(item as any).name} />
      //     </div>
      //     <h2 className="ais-Carousel-hit-title">{(item as any).name}</h2>
      //   </article>
      // )}
      // loaderComponent={() => {
      //   if (isServer) {
      //     console.log(`${PHASE} ChatPageSuggestions loader rendered`);
      //   }
      //   return (
      //     <div data-testid="page-suggestion-loader">Generating suggestion…</div>
      //   );
      // }}
      // errorComponent={({ error }) => {
      //   console.log(`${PHASE} ChatPageSuggestions error: ${error.message}`);
      //   return <div role="alert">{error.message}</div>;
      // }}
    />
  );
}
