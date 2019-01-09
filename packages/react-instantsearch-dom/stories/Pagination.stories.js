import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, number } from '@storybook/addon-knobs';
import { Panel, Pagination, SearchBox } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('Pagination', module);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination">
      <Pagination />
    </WrapWithHits>
  ))
  .add('with all props', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination">
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
    <WrapWithHits linkedStoryGroup="Pagination">
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
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination">
      <Panel header="Pagination" footer="Footer">
        <Pagination />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="Pagination"
    >
      <Panel header="Pagination" footer="Footer">
        <Pagination header="Pagination" />
      </Panel>

      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="ds" />
      </div>
    </WrapWithHits>
  ));
