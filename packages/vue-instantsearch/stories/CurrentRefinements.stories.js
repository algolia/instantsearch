import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('CurrentRefinements', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: '<ais-current-refinements></ais-current-refinements>',
  }))
  .add('with a refinement to clear', () => ({
    template: `<div>
      <ais-current-refinements :clears-query="true"></ais-current-refinements>
      <ais-menu attribute="brand"></ais-menu>
    </div>`,
  }))
  .add('with multiple refinements to clear', () => ({
    template: `<div>
      <ais-current-refinements :clears-query="true"></ais-current-refinements>
      <ais-menu attribute="brand"></ais-menu>
      <hr />
      <ais-hierarchical-menu :attributes="[
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ]"></ais-hierarchical-menu>
      <hr />
      <ais-range-input attribute="price" />
    </div>`,
  }))
  .add('with excluded attributes', () => ({
    template: `
    <div>
      excludes: Brand
      <ais-current-refinements
        :excluded-attributes="['brand']"
        :clearsQuery="true"
      ></ais-current-refinements>
      <ais-menu attribute="brand"></ais-menu>
      <hr />
      <ais-hierarchical-menu :attributes="[
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ]"></ais-hierarchical-menu>
      <hr />
      <ais-range-input attribute="price" />
    </div>`,
  }));
