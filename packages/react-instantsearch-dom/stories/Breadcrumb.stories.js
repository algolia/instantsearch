import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  Breadcrumb,
  HierarchicalMenu,
  Panel,
} from '../packages/react-instantsearch/dom';
import { connectHierarchicalMenu } from '../packages/react-instantsearch/connectors';
import { object, text } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('Breadcrumb', module);
const VirtualHierarchicalMenu = connectHierarchicalMenu(() => null);

stories
  .addWithJSX(
    'default',
    () => (
      <div>
        <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb">
          <Breadcrumb
            attributes={['category', 'sub_category', 'sub_sub_category']}
          />
          <hr />
          <HierarchicalMenu
            attributes={['category', 'sub_category', 'sub_sub_category']}
            defaultRefinement="Cooking > Kitchen textiles"
            showMoreLimit={3}
            showMore={true}
          />
        </WrapWithHits>
      </div>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .add('with custom component', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb">
      <Breadcrumb
        attributes={['category', 'sub_category', 'sub_sub_category']}
        separator={<span> ⚡ </span>}
      />
      <hr />
      <VirtualHierarchicalMenu
        attributes={['category', 'sub_category', 'sub_sub_category']}
        defaultRefinement="Winter holidays > Toys & play"
      />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb">
      <Breadcrumb
        attributes={['category', 'sub_category', 'sub_sub_category']}
        separator={text('separator', ' / ')}
        translations={object('translations', {
          rootLabel: 'Home',
        })}
      />
      <VirtualHierarchicalMenu
        attributes={['category', 'sub_category', 'sub_sub_category']}
        defaultRefinement="Cooking > Bakeware"
      />
    </WrapWithHits>
  ))
  .addWithJSX(
    'with Panel',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb">
        <Panel header="Breadcrumb" footer="footer">
          <Breadcrumb
            attributes={['category', 'sub_category', 'sub_sub_category']}
          />
        </Panel>
        <hr />
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
          defaultRefinement="Cooking > Bakeware"
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Panel but no refinement',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Breadcrumb">
        <Panel header="Breadcrumb" footer="footer">
          <Breadcrumb
            attributes={['category', 'sub_category', 'sub_sub_category']}
          />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
