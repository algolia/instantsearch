import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import {
  Configure,
  Hits,
  Index,
  useFrequentlyBoughtTogether,
} from 'react-instantsearch';

import { HitProps } from '../types';

import type { NextPage } from 'next';

function CustomFrequentlyBoughtTogether({
  objectIDs,
}: {
  objectIDs: string[];
}) {
  const { recommendations } = useFrequentlyBoughtTogether({ objectIDs });
  return (
    <>
      <h3>Frequently bought with…</h3>
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none' }}>
        {recommendations?.map((item) => (
          <li key={item.objectID}>
            <Link href={`/${item.objectID}`} passHref>
              <HitComponent hit={item} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function HitComponent({ hit }: HitProps) {
  return (
    <>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hit.image_urls[0]}
          alt={hit.name}
          style={{ maxHeight: '300px' }}
        />
      </div>
      <div>
        <h2>{hit.name}</h2>
        <p>
          By <strong>{hit.brand}</strong>, in {hit.list_categories.join(' > ')}
        </p>
        <p>
          {hit.price.currency} {hit.price.value.toLocaleString()}
        </p>
      </div>
    </>
  );
}

const OtherPage: NextPage = () => {
  const { query } = useRouter();

  if (!query.pid) {
    return null;
  }

  return (
    <Index indexName="test_FLAGSHIP_ECOM_recommend" indexId="pdp">
      <h1>
        <Link href="/" passHref>
          ← 🏠
        </Link>
        {' · '}
        Object ID: {query.pid}
      </h1>
      <Configure filters={`objectID:"${query.pid}"`} />
      <Hits hitComponent={HitComponent} />
      <CustomFrequentlyBoughtTogether objectIDs={[query.pid as string]} />
    </Index>
  );
};

export default OtherPage;
