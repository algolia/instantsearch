import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  Pagination,
  Panel,
  SearchBox,
} from '../packages/react-instantsearch/dom';
import { withKnobs, boolean, number } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('Pagination', module);

stories
  .addDecorator(withKnobs)
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination">
        <Pagination />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with all props',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination">
        <Pagination
          showFirst={true}
          showLast={true}
          showPrevious={true}
          showNext={true}
          pagesPadding={2}
          maxPages={3}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with panel',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Pagination">
        <Panel title="Pages">
          <Pagination />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with panel but no refinement',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="Pagination"
      >
        <Panel title="Pages">
          <Pagination />
          <div style={{ display: 'none' }}>
            <SearchBox defaultRefinement="ds" />
          </div>
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'playground',
    () => (
      <WrapWithHits linkedStoryGroup="Pagination">
        <Pagination
          showFirst={boolean('show First', true)}
          showLast={boolean('show Last', true)}
          showPrevious={boolean('show Previous', true)}
          showNext={boolean('show Next', true)}
          pagesPadding={number('pages Padding', 2)}
          maxPages={number('max Pages', 3)}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
