import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('HierarchicalMenu', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `<ais-hierarchical-menu :attributes="[
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ]"></ais-hierarchical-menu>`,
  }))
  .add('not showing the parent level', () => ({
    template: `
      <ais-hierarchical-menu
        :attributes="[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]"
        :showParentLevel="false"
      >
      </ais-hierarchical-menu>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-hierarchical-menu
      :attributes="[
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ]"
    >
      <template slot-scope="{items}">
        <pre>{{items}}</pre>
      </template>
    </ais-hierarchical-menu>`,
  }));
