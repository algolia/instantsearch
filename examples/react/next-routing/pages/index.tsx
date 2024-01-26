import Link from 'next/link';
import React from 'react';
import {
  Hits,
  Highlight,
  RefinementList,
  SearchBox,
  useFrequentlyBoughtTogether,
  FrequentlyBoughtTogether,
} from 'react-instantsearch';

import { Panel } from '../components/Panel';

import type { HitProps } from '../types';

function Hit({ hit }: HitProps) {
  return (
    <>
      <Link href={`${hit.objectID}`} passHref className="Hit-label">
        <Highlight hit={hit} attribute="name" />
      </Link>
      <span className="Hit-price">{hit.description}</span>
    </>
  );
}

function CustomFrequentlyBoughtTogether({
  objectIDs,
}: {
  objectIDs: string[];
}) {
  const { recommendations } = useFrequentlyBoughtTogether({ objectIDs });
  return (
    <ul>
      {recommendations.map((item) => (
        <li key={item.objectID}>{item.objectID}</li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <div className="Container">
      <div>
        <FallbackComponent attribute="brand" />
      </div>
      <div>
        <SearchBox />
        <FrequentlyBoughtTogether
          objectIDs={['M0E20000000EAAK']}
          itemComponent={({ item }) => <span>{item.objectID}</span>}
        />
        <CustomFrequentlyBoughtTogether objectIDs={['M0E20000000E1HU']} />
        <Hits hitComponent={Hit} />
      </div>
    </div>
  );
}

function FallbackComponent({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}
