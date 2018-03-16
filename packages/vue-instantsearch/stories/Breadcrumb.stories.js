import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Breadcrumb', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `<ais-breadcrumb :attributes="[
      'hierarchicalCategories.lvl0',
      'hierarchicalCategories.lvl1',
      'hierarchicalCategories.lvl2',
    ]"></ais-breadcrumb>`,
  }))
  .add('with a hierarchical menu', () => ({
    template: `<div>
      <ais-breadcrumb :attributes="[
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ]"></ais-breadcrumb>
      <!--
      <ais-hierarchical-menu :attributes="[
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ]"></ais-hierarchical-menu>
      -->
    </div>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-breadcrumb>
      <template>
        Clear search query
      </template>
    </ais-breadcrumb>`,
  }));
