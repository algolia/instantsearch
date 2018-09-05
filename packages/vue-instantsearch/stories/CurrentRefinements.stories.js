import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';
import { withKnobs, boolean } from '@storybook/addon-knobs/vue';

storiesOf('CurrentRefinements', module)
  .addDecorator(previewWrapper())
  .addDecorator(withKnobs)
  .add('default', () => ({
    template: `
      <ais-current-refinements />
    `,
  }))
  .add('with a refinement to clear', () => ({
    template: `
      <ais-current-refinements :clears-query="true" />
    `,
  }))
  .add('with multiple refinements to clear', () => ({
    template: `
      <div>
        <ais-current-refinements :clears-query="true" />
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
        excludes: Brand
        <ais-current-refinements
          :excluded-attributes="['brand']"
          :clears-query="true"
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
            computedLabel: item.computedLabel.toUpperCase(),
          })
        );
      },
    },
  }))
  .add('playground', () => ({
    template: `
      <ais-current-refinements :clears-query="${boolean('clears-query')}" />
    `,
  }));
