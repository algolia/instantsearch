import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import PropTypes from 'prop-types';
import React from 'react';
import { connectHitInsights } from 'react-instantsearch-core';
import {
  Hits,
  Highlight,
  Panel,
  Snippet,
  Configure,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('Hits', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="Hits.stories.js">
      <Hits />
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
      <WrapWithHits linkedStoryGroup="Hits.stories.js">
        <Hits hitComponent={Product} />
      </WrapWithHits>
    );
  })
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="Hits.stories.js">
      <Panel header="Hits" footer="Footer">
        <Hits />
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
        <Hits hitComponent={ProductWithInsights} />
      </WrapWithHits>
    );
  });
