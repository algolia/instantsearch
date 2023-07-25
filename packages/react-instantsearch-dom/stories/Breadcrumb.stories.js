import { object, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  Breadcrumb,
  HierarchicalMenu,
  Panel,
  connectHierarchicalMenu,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('Breadcrumb', module);
const VirtualHierarchicalMenu = connectHierarchicalMenu(() => null);

stories
  .add('default', () => (
    <div>
      <WrapWithHits
        hasPlayground={true}
        linkedStoryGroup="Breadcrumb.stories.js"
      >
        <Breadcrumb
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]}
        />
        <hr />
        <HierarchicalMenu
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]}
          defaultRefinement="Cameras & Camcorders > Digital Cameras"
          showMoreLimit={3}
          showMore={true}
        />
      </WrapWithHits>
    </div>
  ))
  .add('with custom component', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb.stories.js">
      <Breadcrumb
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        separator={<span> ⚡ </span>}
      />
      <hr />
      <VirtualHierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        defaultRefinement="Cameras & Camcorders > Digital Cameras"
      />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb.stories.js">
      <Breadcrumb
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        separator={text('separator', ' / ')}
        translations={object('translations', {
          rootLabel: 'Home',
        })}
      />
      <VirtualHierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        defaultRefinement="Cameras & Camcorders > Digital Cameras"
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb.stories.js">
      <Panel header="Breadcrumb" footer="footer">
        <Breadcrumb
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]}
        />
      </Panel>
      <hr />
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        defaultRefinement="Cameras & Camcorders > Digital Cameras"
      />
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb.stories.js">
      <Panel header="Breadcrumb" footer="footer">
        <Breadcrumb
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]}
        />
      </Panel>
    </WrapWithHits>
  ));
