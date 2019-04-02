import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import {
  InfiniteHits,
  Highlight,
  Panel,
  Snippet,
  Configure,
} from 'react-instantsearch-dom';
import { WrapWithHits } from './util';
import { action } from '@storybook/addon-actions';
import { connectHitInsights } from 'react-instantsearch-core';

const stories = storiesOf('InfiniteHits', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits" pagination={false}>
      <InfiniteHits />
    </WrapWithHits>
  ))
  .add('with custom rendering', () => {
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
      <WrapWithHits linkedStoryGroup="InfiniteHits">
        <InfiniteHits hitComponent={Product} />
      </WrapWithHits>
    );
  })
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits" pagination={false}>
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
      <WrapWithHits linkedStoryGroup="Hits">
        <Configure clickAnalytics />
        <InfiniteHits hitComponent={ProductWithInsights} />
      </WrapWithHits>
    );
  });
