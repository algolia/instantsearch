import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('RangeInput', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `<ais-range-input attribute="price"></ais-range-input>`,
  }))
  .add('with min', () => ({
    template: `<ais-range-input attribute="price" :min=10></ais-range-input>`,
  }))
  .add('with max', () => ({
    template: `<ais-range-input attribute="price" :max=40></ais-range-input>`,
  }))
  .add('with min and max', () => ({
    template: `<ais-range-input attribute="price" :min=10 :max=50></ais-range-input>`,
  }));
