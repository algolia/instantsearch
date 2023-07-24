import { storiesOf } from '@storybook/react';
import React from 'react';
import { NumericMenu, Panel, Configure } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('NumericMenu', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="NumericMenu.stories.js">
      <NumericMenu
        attribute="price"
        items={[
          { start: 0, end: 10, label: '<$10' },
          { start: 10, end: 100, label: '$10-$100' },
          { start: 100, end: 500, label: '$100-$500' },
          { start: 500, label: '>$500' },
        ]}
      />
    </WrapWithHits>
  ))
  .add('with a default range selected', () => (
    <WrapWithHits linkedStoryGroup="NumericMenu.stories.js">
      <NumericMenu
        attribute="price"
        items={[
          { end: 10, label: '<$10' },
          { start: 10, end: 100, label: '$10-$100' },
          { start: 100, end: 500, label: '$100-$500' },
          { start: 500, label: '>$500' },
        ]}
        defaultRefinement=":10"
      />
    </WrapWithHits>
  ))
  .add('with some non selectable ranges', () => (
    <WrapWithHits searchBox={false} linkedStoryGroup="NumericMenu.stories.js">
      <NumericMenu
        attribute="price"
        items={[
          { end: 10, label: '<$10' },
          { start: 10, end: 100, label: '$10-$100' },
          { start: 100, end: 500, label: '$100-$500' },
          { start: 90000, label: '>$90000' },
        ]}
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="NumericMenu.stories.js">
      <Panel header="Numeric Menu" footer="Footer">
        <NumericMenu
          attribute="price"
          items={[
            { end: 10, label: '<$10' },
            { start: 10, end: 100, label: '$10-$100' },
            { start: 100, end: 500, label: '$100-$500' },
            { start: 500, label: '>$500' },
          ]}
        />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits linkedStoryGroup="NumericMenu.stories.js">
      <Configure filters="price>200000" />

      <Panel header="Numeric Menu" footer="Footer">
        <NumericMenu
          attribute="price"
          items={[
            { end: 10, label: '<$10' },
            { start: 10, end: 100, label: '$10-$100' },
            { start: 100, end: 500, label: '$100-$500' },
            { start: 500, label: '>$500' },
          ]}
        />
      </Panel>
    </WrapWithHits>
  ));
