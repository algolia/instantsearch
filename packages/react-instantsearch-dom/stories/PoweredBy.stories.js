import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { PoweredBy } from '../packages/react-instantsearch/dom';
import { displayName, filterProps, WrapWithHits } from './util';
import { checkA11y } from 'storybook-addon-a11y';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('PoweredBy', module);

stories.addDecorator(checkA11y).addWithJSX('default',
() => (
  <WrapWithHits linkedStoryGroup="PoweredBy">
    <PoweredBy />
  </WrapWithHits>
),
{
  displayName,
  filterProps,
});
