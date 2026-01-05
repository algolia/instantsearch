'use client';

import { Hit } from 'instantsearch.js';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createInstantSearchNextInstance, InstantSearchNext } from 'react-instantsearch-nextjs';

import { agentId, searchClient } from '../lib/client';

// Chat uses sessionStorage, so it must be client-side only
const Chat = dynamic(
  () => import('react-instantsearch').then((mod) => mod.Chat),
  { ssr: false }
);

function ChatItem({ item }: { item: Hit }) {
  return (
    <article className="ais-Carousel-hit">
      <div className="ais-Carousel-hit-image">
        <img src={item.image} alt={item.name} />
      </div>
      <h2 className="ais-Carousel-hit-title">
        <Link
          href={`/products/${item.objectID}`}
          className="ais-Carousel-hit-link"
        >
          {item.name}
        </Link>
      </h2>
    </article>
  );
}

const searchInstance = createInstantSearchNextInstance();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName="instant_search"
      insights={true}
      instance={searchInstance}
      routing={{
        router: { cleanUrlOnDispose: false },
      }}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      {children}
      <Chat
        agentId={agentId}
        itemComponent={ChatItem}
      />
    </InstantSearchNext>
  );
}

