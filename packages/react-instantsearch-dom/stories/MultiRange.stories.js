import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  MultiRange,
  Panel,
  Configure,
} from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import { checkA11y } from 'storybook-addon-a11y';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('MultiRange', module);

stories
  .addDecorator(withKnobs)
  .addDecorator(checkA11y)
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits linkedStoryGroup="MultiRange">
        <MultiRange
          attributeName="price"
          items={[
            { end: 10, label: '<$10' },
            { start: 10, end: 100, label: '$10-$100' },
            { start: 100, end: 500, label: '$100-$500' },
            { start: 500, label: '>$500' },
          ]}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with a default range selected',
    () => (
      <WrapWithHits linkedStoryGroup="MultiRange">
        <MultiRange
          attributeName="price"
          items={[
            { end: 10, label: '<$10' },
            { start: 10, end: 100, label: '$10-$100' },
            { start: 100, end: 500, label: '$100-$500' },
            { start: 500, label: '>$500' },
          ]}
          defaultRefinement=":10"
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with some non selectable ranges',
    () => (
      <WrapWithHits searchBox={false} linkedStoryGroup="MultiRange">
        <MultiRange
          attributeName="price"
          items={[
            { end: 10, label: '<$10' },
            { start: 10, end: 100, label: '$10-$100' },
            { start: 100, end: 500, label: '$100-$500' },
            { start: 90000, label: '>$90000' },
          ]}
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
      <WrapWithHits linkedStoryGroup="MultiRange">
        <Panel title="Price">
          <MultiRange
            attributeName="price"
            items={[
              { end: 10, label: '<$10' },
              { start: 10, end: 100, label: '$10-$100' },
              { start: 100, end: 500, label: '$100-$500' },
              { start: 500, label: '>$500' },
            ]}
          />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with panel but no available refinements',
    () => (
      <WrapWithHits searchBox={false} linkedStoryGroup="MultiRange">
        <Panel title="Price">
          <Configure filters="price>200000" />
          <MultiRange
            attributeName="price"
            items={[
              { end: 10, label: '<$10' },
              { start: 10, end: 100, label: '$10-$100' },
              { start: 100, end: 500, label: '$100-$500' },
              { start: 500, label: '>$500' },
            ]}
          />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
