import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { Toggle } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import { checkA11y } from 'storybook-addon-a11y';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('Toggle', module);

stories
  .addDecorator(withKnobs)
  .addDecorator(checkA11y)
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits linkedStoryGroup="Toggle">
        <Toggle
          attributeName="materials"
          label="Made with solid pine"
          value={'Solid pine'}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'checked by default',
    () => (
      <WrapWithHits linkedStoryGroup="Toggle">
        <Toggle
          attributeName="materials"
          label="Made with solid pine"
          value={'Solid pine'}
          defaultRefinement={true}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
