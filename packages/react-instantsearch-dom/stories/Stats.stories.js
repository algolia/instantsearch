import React from 'react';
import { storiesOf } from '@storybook/react';
import { Panel, Stats, SmartSort } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('Stats', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="Stats.stories.js">
      <div>
        <Stats />
      </div>
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="Stats.stories.js">
      <Panel header="Stats" footer="Footer">
        <Stats />
      </Panel>
    </WrapWithHits>
  ))
  .add('with sorted hits', () => (
    <WrapWithHits
      appId="C7RIRJRYR9"
      apiKey="77af6d5ffb27caa5ff4937099fcb92e8"
      indexName="test_Bestbuy_vr_price_asc"
      linkedStoryGroup="Stats.stories.js"
    >
      <div>
        <Stats />
        <SmartSort
          textComponent={({ isSmartSorted }) => (
            <div>
              {isSmartSorted
                ? 'We removed some search results to show you the most relevant ones'
                : 'Currently showing all results'}
            </div>
          )}
          buttonTextComponent={({ isSmartSorted }) => (
            <div>
              {isSmartSorted ? 'See all results' : 'See relevant results'}
            </div>
          )}
        />
      </div>
    </WrapWithHits>
  ));
