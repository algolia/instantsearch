import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('HitsPerPage', module)
  .addDecorator(previewWrapper)
  .add('simple usage', () => ({
    template: `<ais-hits-per-page :items="[{
        label: '10 results', value: 10, default: true,
      }, {
        label: '20 results', value: 20
      }]"></ais-hits-per-page>`,
  }))
  .add('default on second element', () => ({
    template: `<ais-hits-per-page :items="[{
        label: '10 results', value: 10
      }, {
        label: '20 results', value: 20, default: true
      }]"></ais-hits-per-page>`,
  }));
