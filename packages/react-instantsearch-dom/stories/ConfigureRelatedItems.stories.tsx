import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';
import {
  Configure,
  ExperimentalConfigureRelatedItems,
  Hits,
  Index,
  connectPagination,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

type Hit = any;
type PaginationProvidedProps = {
  currentRefinement: number;
  refine: (page: number) => void;
  nbPages: number;
};

const stories = storiesOf('ConfigureRelatedItems', module);

stories.add('default', () => <ConfigureRelatedItemsExample />);

function RelatedHit({ hit }: { hit: Hit }) {
  return (
    <div>
      <div className="ais-RelatedHits-item-image">
        <img src={hit.image} alt={hit.name} />
      </div>

      <div className="ais-RelatedHits-item-title">
        <h4>{hit.name}</h4>
      </div>
    </div>
  );
}

const PreviousPagination = connectPagination(
  ({ currentRefinement, refine }: PaginationProvidedProps) => {
    return (
      <button
        className="ais-RelatedHits-button"
        disabled={currentRefinement === 1}
        onClick={() => {
          refine(currentRefinement - 1);
        }}
      >
        ←
      </button>
    );
  }
);

const NextPagination = connectPagination(
  ({ currentRefinement, refine, nbPages }: PaginationProvidedProps) => {
    return (
      <button
        className="ais-RelatedHits-button"
        disabled={currentRefinement + 1 === nbPages}
        onClick={() => {
          refine(currentRefinement + 1);
        }}
      >
        →
      </button>
    );
  }
);

function ConfigureRelatedItemsExample() {
  const [referenceHit, setReferenceHit] = useState<Hit | null>(null);

  const ReferenceHit = React.memo<{ hit: Hit }>(
    ({ hit }) => {
      return (
        <div ref={() => setReferenceHit(hit)}>
          <img src={hit.image} alt={hit.name} />
          <h3>{hit.name}</h3>
        </div>
      );
    },
    (prevProps, nextProps) => {
      return prevProps.hit.objectID === nextProps.hit.objectID;
    }
  );

  return (
    <WrapWithHits linkedStoryGroup="ConfigureRelatedItems.stories.tsx">
      <Index indexName="instant_search" indexId="mainIndex">
        <Configure hitsPerPage={1} />

        <Hits hitComponent={ReferenceHit} />
      </Index>

      {referenceHit && (
        <Index indexName="instant_search" indexId="relatedIndex">
          <Configure hitsPerPage={4} />
          <ExperimentalConfigureRelatedItems
            hit={referenceHit}
            matchingPatterns={{
              brand: { score: 3 },
              type: { score: 10 },
              categories: { score: 2 },
            }}
          />

          <h2>Related items</h2>

          <div className="related-items">
            <PreviousPagination />
            <Hits hitComponent={RelatedHit} />
            <NextPagination />
          </div>
        </Index>
      )}
    </WrapWithHits>
  );
}
