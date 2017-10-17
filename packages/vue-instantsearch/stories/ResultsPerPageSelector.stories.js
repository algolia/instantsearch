import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('ResultsPerPageSelector', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-results-per-page-selector></ais-results-per-page-selector>',
  }));
