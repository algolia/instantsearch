import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';
import { withKnobs } from '@storybook/addon-knobs/vue';

storiesOf('ais-current-refinements', module)
  .addDecorator(previewWrapper())
  .addDecorator(withKnobs)
  .add('default', () => ({
    template: `
      <ais-current-refinements />
    `,
  }))
  .add('with a refinement to clear', () => ({
    template: `
      <ais-current-refinements :excluded-attributes="[]" />
    `,
  }))
  .add('with multiple refinements to clear', () => ({
    template: `
      <div>
        <ais-current-refinements :excluded-attributes="[]" />
        <hr />
        <ais-hierarchical-menu
          :attributes="[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]"
        />
        <hr />
        <ais-range-input attribute="price" />
      </div>
    `,
  }))
  .add('with excluded attributes', () => ({
    template: `
      <div>
        <p><strong>excludes: Brand</strong>
        <ais-current-refinements
          :excluded-attributes="['brand']"
        />
        <hr />
        <ais-hierarchical-menu
          :attributes="[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]"
        />
        <hr />
        <ais-range-input attribute="price" />
      </div>
    `,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-current-refinements :transform-items="transformItems" />
    `,
    methods: {
      transformItems(items) {
        return items.map(item =>
          Object.assign({}, item, {
            label: item.label.toUpperCase(),
          })
        );
      },
    },
  }));
