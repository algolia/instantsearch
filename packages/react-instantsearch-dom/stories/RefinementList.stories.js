import { boolean, number, array } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import orderBy from 'lodash.orderby';
import React from 'react';
import { Panel, RefinementList, SearchBox } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('RefinementList', module);

stories
  .add('default', () => (
    <WrapWithHits
      linkedStoryGroup="RefinementList.stories.js"
      hasPlayground={true}
    >
      <RefinementList attribute="brand" />
    </WrapWithHits>
  ))
  .add('with selected item', () => (
    <WrapWithHits
      linkedStoryGroup="RefinementList.stories.js"
      hasPlayground={true}
    >
      <RefinementList attribute="brand" defaultRefinement={['Apple']} />
    </WrapWithHits>
  ))
  .add('with show more', () => (
    <WrapWithHits
      linkedStoryGroup="RefinementList.stories.js"
      hasPlayground={true}
    >
      <RefinementList
        attribute="brand"
        limit={2}
        showMoreLimit={5}
        showMore={true}
      />
    </WrapWithHits>
  ))
  .add('with search inside items', () => (
    <WrapWithHits
      linkedStoryGroup="RefinementList.stories.js"
      hasPlayground={true}
    >
      <RefinementList attribute="brand" searchable />
    </WrapWithHits>
  ))
  .add('with the sort strategy changed', () => (
    <WrapWithHits
      linkedStoryGroup="RefinementList.stories.js"
      hasPlayground={true}
    >
      <RefinementList
        attribute="brand"
        transformItems={(items) =>
          orderBy(items, ['label', 'count'], ['asc', 'desc'])
        }
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits
      linkedStoryGroup="RefinementList.stories.js"
      hasPlayground={true}
    >
      <Panel header="Refinement List" footer="Footer">
        <RefinementList attribute="brand" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits
      searchBox={false}
      linkedStoryGroup="RefinementList.stories.js"
      hasPlayground={true}
    >
      <Panel header="Refinement List" footer="Footer">
        <RefinementList attribute="brand" />
      </Panel>

      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="tutututututu" />
      </div>
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="RefinementList.stories.js">
      <RefinementList
        attribute="brand"
        defaultRefinement={array('defaultSelectedItem', ['Apple', 'Samsung'])}
        limit={number('limit', 10)}
        showMoreLimit={number('showMoreLimit', 20)}
        showMore={boolean('showMore', true)}
      />
    </WrapWithHits>
  ));
