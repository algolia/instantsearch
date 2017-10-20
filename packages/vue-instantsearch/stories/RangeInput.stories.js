import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('RangeInput', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `
      <ais-range-input
        attribute-name="price"
      />
    `,
  }))
  .add('with precision', () => ({
    template: `
    <ais-range-input
      attribute-name="price"
      :precision="2"
    />
    `,
  }))
  .add('with default refinement', () => ({
    template: `
    <ais-range-input
      attribute-name="price"
      :default-refinement="{
        min: 10,
        max: 250,
      }"
    />
    `,
  }))
  .add('with min boundaries', () => ({
    template: `
    <ais-range-input
      attribute-name="price"
      :min="30"
    />
    `,
  }))
  .add('with max boundaries', () => ({
    template: `
    <ais-range-input
      attribute-name="price"
      :max="500"
    />
    `,
  }))
  .add('with min / max boundaries', () => ({
    template: `
    <ais-range-input
      attribute-name="price"
      :min="30"
      :max="500"
    />
    `,
  }))
  .add('with min / max boundaries & default refinement', () => ({
    template: `
    <ais-range-input
      attribute-name="price"
      :min="30"
      :max="500"
      :default-refinement="{
        min: 50,
        max: 250,
      }"
    />
    `,
  }))
  .add('with separator', () => ({
    template: `
      <ais-range-input attribute-name="price">
        <span slot="separator">--></span>
      </ais-range-input>
    `,
  }))
  .add('with submit', () => ({
    template: `
      <ais-range-input attribute-name="price">
        <button slot="submit">Go</button>
      </ais-range-input>
    `,
  }))
  .add('with header', () => ({
    template: `
      <ais-range-input attribute-name="price">
        <span slot="header">Custom header</span>
      </ais-range-input>
    `,
  }))
  .add('with footer', () => ({
    template: `
      <ais-range-input attribute-name="price">
        <span slot="footer">Custom footer</span>
      </ais-range-input>
    `,
  }));
