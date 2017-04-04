import React from 'react';
import { storiesOf } from '@kadira/storybook';
import {
  Pagination,
  Panel,
  SearchBox,
} from '../packages/react-instantsearch/dom';
import { withKnobs, boolean, number } from '@kadira/storybook-addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('Pagination', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination">
      <Pagination />
    </WrapWithHits>
  ))
  .add('with all props', () => (
    <WrapWithHits>
      <Pagination
        showFirst={true}
        showLast={true}
        showPrevious={true}
        showNext={true}
        pagesPadding={2}
        maxPages={3}
      />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits>
      <Pagination
        showFirst={boolean('show First', true)}
        showLast={boolean('show Last', true)}
        showPrevious={boolean('show Previous', true)}
        showNext={boolean('show Next', true)}
        pagesPadding={number('pages Padding', 2)}
        maxPages={number('max Pages', 3)}
      />
    </WrapWithHits>
  ))
  .add('with panel', () => (
    <WrapWithHits>
      <Panel title="Pages">
        <Pagination />
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no refinement', () => (
    <WrapWithHits searchBox={false}>
      <Panel title="Pages">
        <Pagination />
        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="ds" />
        </div>
      </Panel>
    </WrapWithHits>
  ));
