import React from 'react';
import { GetServerSideProps } from 'next';
import algoliasearch from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import {
  InstantSearch,
  Hits,
  Highlight,
  RefinementList,
  SearchBox,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  DynamicWidgets,
} from 'react-instantsearch-hooks-web';
import { getServerState } from 'react-instantsearch-hooks-server';
import { Panel } from '../components/Panel';
import { renderToString } from 'react-dom/server';
import singletonRouter from 'next/router';
import Link from 'next/link';
import { createInstantSearchRouterNext } from 'react-instantsearch-hooks-router-nextjs';
import Head from 'next/head';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <Link href="/test" passHref className="Hit-label">
        <Highlight hit={hit} attribute="name" />
      </Link>
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}

type HomePageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

export default function HomePage({ serverState, url }: HomePageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <Head>
        <title>React InstantSearch - Next.js</title>
      </Head>

      <InstantSearch
        searchClient={client}
        indexName="instant_search"
        routing={{
          router: createInstantSearchRouterNext({
            singletonRouter,
            serverUrl: url,
          }),
        }}
      >
        <div className="Container">
          <div>
            <Panel header="brand">
              <RefinementList attribute="brand" />
            </Panel>
            <Panel header="categories">
              <RefinementList attribute="categories" />
            </Panel>
            <DynamicWidgets fallbackComponent={FallbackComponent} />
          </div>
          <div>
            <SearchBox />
            <Hits hitComponent={Hit} />
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

function FallbackComponent({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> =
  async function getServerSideProps({ req }) {
    const protocol = req.headers.referer?.split('://')[0] || 'https';
    const url = `${protocol}://${req.headers.host}${req.url}`;
    const serverState = await getServerState(<HomePage url={url} />, {
      renderToString,
    });

    return {
      props: {
        serverState,
        url,
      },
    };
  };
