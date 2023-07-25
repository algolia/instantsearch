import { storiesOf } from '@storybook/react';
import React from 'react';
import { RelevantSort } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('RelevantSort', module);

stories.add('default', () => (
  <WrapWithHits
    hasPlayground={true}
    appId="C7RIRJRYR9"
    apiKey="77af6d5ffb27caa5ff4937099fcb92e8"
    indexName="test_Bestbuy_vr_price_asc"
    linkedStoryGroup="RelevantSort.stories.js"
  >
    <RelevantSort
      textComponent={({ isRelevantSorted }) => (
        <div>
          {isRelevantSorted
            ? 'We removed some search results to show you the most relevant ones'
            : 'Currently showing all results'}
        </div>
      )}
      buttonTextComponent={({ isRelevantSorted }) => (
        <div>
          {isRelevantSorted ? 'See all results' : 'See relevant results'}
        </div>
      )}
    />
  </WrapWithHits>
));
