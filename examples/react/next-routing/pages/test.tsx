// This is only to test `onStateChange` does not get called twice
import { liteClient as algoliasearch } from 'algoliasearch-v5/lite';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import singletonRouter from 'next/router';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  InstantSearch,
  RefinementList,
  SearchBox,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  getServerState,
} from 'react-instantsearch';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

type HomePageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

export default function HomePage({ serverState, url }: HomePageProps) {
  const [onStateChangeCalled, setOnStateChangeCalled] = React.useState(0);

  return (
    <InstantSearchSSRProvider {...serverState}>
      <Head>
        <title>React InstantSearch - Next.js</title>
      </Head>

      {/* If you have navigation links outside of InstantSearch */}
      <Link href="/test?instant_search%5Bquery%5D=apple">Prefilled query</Link>

      <InstantSearch
        searchClient={client}
        indexName="instant_search"
        routing={{
          router: createInstantSearchRouterNext({
            singletonRouter,
            serverUrl: url,
            routerOptions: {
              cleanUrlOnDispose: false,
            },
          }),
        }}
        insights={true}
        onStateChange={({ uiState, setUiState }) => {
          setOnStateChangeCalled((times) => times + 1);
          setUiState(uiState);
        }}
      >
        <output id="onStateChange">{onStateChangeCalled}</output>
        <div className="Container">
          <div>
            <RefinementList attribute="brand" />
          </div>
          <div>
            <SearchBox />
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
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
