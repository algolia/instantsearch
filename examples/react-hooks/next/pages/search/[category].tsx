import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { renderToString } from 'react-dom/server';
import algoliasearch from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import {
  DynamicWidgets,
  InstantSearch,
  Hits,
  Highlight,
  RefinementList,
  SearchBox,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  useMenu,
} from 'react-instantsearch-hooks-web';
import { getServerState } from 'react-instantsearch-hooks-server';
import type { UiState } from 'instantsearch.js';
import { Panel } from '../../components/Panel';
import Menu from '../../components/Menu';
import { MenuConnectorParams } from 'instantsearch.js/es/connectors/menu/connectMenu';

import { createInstantSearchNextRouter } from 'react-instantsearch-hooks-next-router';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

function VirtualMenu(props: MenuConnectorParams) {
  useMenu(props);
  return null;
}

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <Highlight hit={hit} attribute="name" className="Hit-label" />
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}

type CategoryPageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
  category?: string;
};

function FallbackComponent({ attribute }: { attribute: string }) {
  return attribute.toLowerCase().includes('categor') ? null : (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}

type RouteState = {
  category?: string;
  brand?: string;
};

export default function CategoryPage({ serverState, url }: CategoryPageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <Head>
        <title>React InstantSearch Hooks - Next.js</title>
      </Head>

      <InstantSearch<UiState, RouteState>
        searchClient={client}
        indexName="instant_search"
        routing={{
          router: createInstantSearchNextRouter(url, {
            createURL({ routeState, location, qsModule }) {
              const { category, ...queryParameters } = routeState;
              const { origin, pathname } = location;

              return `${origin}${pathname}${qsModule.stringify(
                queryParameters,
                {
                  addQueryPrefix: true,
                }
              )}`;
            },
            parseURL({ location, qsModule }) {
              return {
                category: decodeURIComponent(
                  location.pathname.split('/').pop()!
                ),
                ...qsModule.parse(location.search, { ignoreQueryPrefix: true }),
              };
            },
          }),
          stateMapping: {
            routeToState(routeState) {
              const { category, ...rest } = routeState;
              return {
                instant_search: {
                  menu: {
                    'hierarchicalCategories.lvl0': `${category}`,
                  },
                  ...rest,
                },
              };
            },
            stateToRoute(uiState) {
              const { menu, ...rest } = uiState.instant_search;

              return {
                category: menu?.['hierarchicalCategories.lvl0'],
                ...rest,
              };
            },
          },
        }}
      >
        <Menu />
        <VirtualMenu attribute="hierarchicalCategories.lvl0" />
        <div className="Container">
          <div>
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

export const getServerSideProps: GetServerSideProps<CategoryPageProps> =
  async function getServerSideProps({ req, params }) {
    const protocol = req.headers.referer?.split('://')[0] || 'https';
    const url = `${protocol}://${req.headers.host}${req.url}`;
    const category = params?.category as string;
    const serverState = await getServerState(
      <CategoryPage url={url} category={category} />,
      { renderToString }
    );

    return {
      props: {
        serverState,
        url,
        category,
      },
    };
  };
