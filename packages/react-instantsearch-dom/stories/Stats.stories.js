import React from 'react';
import { storiesOf } from '@storybook/react';
import { Panel, Stats } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('Stats', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="Stats">
      <div>
        <Stats />
      </div>
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="Stats">
      <Panel header="Stats" footer="Footer">
        <Stats />
      </Panel>
    </WrapWithHits>
  ));
