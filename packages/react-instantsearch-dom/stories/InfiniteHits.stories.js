import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import PropTypes from 'prop-types';
import React from 'react';
import { connectHitInsights } from 'react-instantsearch-core';
import {
  InfiniteHits,
  Highlight,
  Panel,
  Snippet,
  Configure,
  connectInfiniteHits,
  createInfiniteHitsSessionStorageCache,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('InfiniteHits', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits.stories.js" pagination={false}>
      <InfiniteHits />
    </WrapWithHits>
  ))
  .add('with previous button', () => {
    const urlLogger = action('Routing state');
    return (
      <WrapWithHits
        linkedStoryGroup="InfiniteHits.stories.js"
        pagination={false}
        initialSearchState={{ page: 3 }}
        onSearchStateChange={({ configure, ...searchState }) => {
          urlLogger(JSON.stringify(searchState, null, 2));
        }}
      >
        <InfiniteHits showPrevious={true} />
      </WrapWithHits>
    );
  })
  .add('with custom rendering', () => {
    const urlLogger = action('Routing state');

    const MyInfiniteHits = ({
      hits,
      hasMore,
      hasPrevious,
      refine,
      refinePrevious,
    }) => (
      <div>
        <button disabled={!hasPrevious} onClick={refinePrevious}>
          Show previous
        </button>
        <ol>
          {hits.map((hit) => (
            <li key={hit.objectID}>{hit.name}</li>
          ))}
        </ol>
        <button disabled={!hasMore} onClick={refine}>
          Show more
        </button>
      </div>
    );

    MyInfiniteHits.propTypes = {
      hits: PropTypes.array.isRequired,
      hasMore: PropTypes.bool.isRequired,
      hasPrevious: PropTypes.bool.isRequired,
      refine: PropTypes.func.isRequired,
      refinePrevious: PropTypes.func.isRequired,
    };

    const CustomInfiniteHits = connectInfiniteHits(MyInfiniteHits);

    return (
      <WrapWithHits
        linkedStoryGroup="InfiniteHits.stories.js"
        pagination={false}
        initialSearchState={{ page: 3 }}
        onSearchStateChange={({ configure, ...searchState }) => {
          urlLogger(JSON.stringify(searchState, null, 2));
        }}
      >
        <CustomInfiniteHits />
      </WrapWithHits>
    );
  })
  .add('with custom hitComponent', () => {
    function Product({ hit }) {
      return (
        <div>
          <Highlight attribute="name" hit={hit} />
          <p>
            <Highlight attribute="type" hit={hit} />
          </p>
          <p>
            <Snippet attribute="description" hit={hit} />
          </p>
        </div>
      );
    }

    Product.propTypes = {
      hit: PropTypes.object.isRequired,
    };

    return (
      <WrapWithHits linkedStoryGroup="InfiniteHits.stories.js">
        <InfiniteHits hitComponent={Product} />
      </WrapWithHits>
    );
  })
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits.stories.js" pagination={false}>
      <Panel header="Infinite hits" footer="Footer">
        <InfiniteHits />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Insights', () => {
    const insightsClient = (method, payload) =>
      action(`[InsightsClient] sent ${method} with payload`)(payload);
    const ProductWithInsights = connectHitInsights(insightsClient)(Product);

    function Product({ hit, insights }) {
      return (
        <div>
          <Highlight attribute="name" hit={hit} />
          <button
            onClick={() =>
              insights('clickedObjectIDsAfterSearch', {
                eventName: 'Add to cart',
              })
            }
          >
            Add to cart
          </button>
        </div>
      );
    }
    Product.propTypes = {
      hit: PropTypes.object.isRequired,
      insights: PropTypes.func.isRequired,
    };
    return (
      <WrapWithHits linkedStoryGroup="Hits.stories.js">
        <Configure clickAnalytics />
        <InfiniteHits hitComponent={ProductWithInsights} />
      </WrapWithHits>
    );
  })
  .add('with sessionStorage cache', () => {
    function Product({ hit }) {
      return (
        <div>
          <span>#{hit.__position}. </span>
          <Highlight attribute="name" hit={hit} />
          <p>
            <a href="https://google.com">Details</a>
          </p>
        </div>
      );
    }
    Product.propTypes = {
      hit: PropTypes.object.isRequired,
    };

    return (
      <WrapWithHits linkedStoryGroup="InfiniteHits.stories.js">
        <Configure hitsPerPage={16} />
        <InfiniteHits
          hitComponent={Product}
          cache={createInfiniteHitsSessionStorageCache()}
        />
      </WrapWithHits>
    );
  });
