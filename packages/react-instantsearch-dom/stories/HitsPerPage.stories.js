import React from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import { HitsPerPage, Panel } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('HitsPerPage', module);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="HitsPerPage">
      <HitsPerPage
        defaultRefinement={4}
        items={[
          { value: 2, label: '2 hits per page' },
          { value: 4, label: '4 hits per page' },
          { value: 6, label: '6 hits per page' },
          { value: 8, label: '8 hits per page' },
        ]}
      />
    </WrapWithHits>
  ))
  .add('without label', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="HitsPerPage">
      <HitsPerPage
        defaultRefinement={4}
        items={[{ value: 2 }, { value: 4 }, { value: 6 }, { value: 8 }]}
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="HitsPerPage">
      <Panel header="Hits per page" footer="Footer">
        <HitsPerPage
          defaultRefinement={4}
          items={[
            { value: 2, label: '2 hits per page' },
            { value: 4, label: '4 hits per page' },
            { value: 6, label: '6 hits per page' },
            { value: 8, label: '8 hits per page' },
          ]}
        />
      </Panel>
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="HitsPerPage">
      <HitsPerPage
        defaultRefinement={number('default hits per page', 4)}
        items={[
          { value: 2, label: '2 hits per page' },
          { value: 4, label: '4 hits per page' },
          { value: 6, label: '6 hits per page' },
          { value: 8, label: '8 hits per page' },
        ]}
      />
    </WrapWithHits>
  ));
