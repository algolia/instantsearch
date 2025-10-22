import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { BaseHit } from 'instantsearch.js';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Pagination,
} from 'react-instantsearch';

import { ColorRefinementList } from '../src';
import { APP_ID, API_KEY, INDEX_NAME } from '../config/algolia';

import { useDebugger, capitalize } from './utils';

import '../src/style.scss';
import './index.scss';

const searchClient = algoliasearch(APP_ID, API_KEY);

// Simple Panel component for v7
const Panel = ({
  header,
  className,
  children
}: {
  header?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={className}>
    {header && <h3>{header}</h3>}
    {children}
  </div>
);

const HitComponent = ({ hit }: { hit: BaseHit }) => {
  return (
    <>
      <img src={hit.image_urls[0]} alt={hit.name} />
      <div>{hit.name}</div>
    </>
  );
};

const App = () => {
  const { props } = useDebugger();

  return (
    <InstantSearch
      indexName={INDEX_NAME}
      searchClient={searchClient}
    >
      <main className="container">
        <Panel header="Colors" className="panel__filters">
          <ColorRefinementList
            {...props}
            translations={{
              refineOn: (value: string) => `Refine on ${value}`,
              colors: (refinedCount: number) =>
                `Colors${refinedCount ? `, ${refinedCount} selected` : ''}`,
              showMore: (expanded: boolean) =>
                expanded ? 'Show less' : 'Show more',
            }}
            transformItems={(items) =>
              items.map((item) => ({
                ...item,
                label: capitalize(item.label),
              }))
            }
          />
        </Panel>

        <Panel className="panel__results">
          <SearchBox />
          <Hits hitComponent={HitComponent} />
          <Pagination />
        </Panel>
      </main>
    </InstantSearch>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
