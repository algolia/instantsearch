import { boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Panel, Pagination, SearchBox } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('Pagination', module);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination.stories.js">
      <Pagination />
    </WrapWithHits>
  ))
  .add('with all props', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination.stories.js">
      <Pagination
        showFirst={true}
        showLast={true}
        showPrevious={true}
        showNext={true}
        padding={2}
        totalPages={3}
      />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="Pagination.stories.js">
      <Pagination
        showFirst={boolean('show First', true)}
        showLast={boolean('show Last', true)}
        showPrevious={boolean('show Previous', true)}
        showNext={boolean('show Next', true)}
        padding={number('pages Padding', 2)}
        totalPages={number('max Pages', 3)}
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination.stories.js">
      <Panel header="Pagination" footer="Footer">
        <Pagination />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="Pagination.stories.js"
    >
      <Panel header="Pagination" footer="Footer">
        <Pagination header="Pagination" />
      </Panel>

      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="ds" />
      </div>
    </WrapWithHits>
  ));
