import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('__template__', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-template></ais-template>',
  }))
  .add('clearing query', () => ({
    template: `<div>
      <ais-template :clearsQuery="true"></ais-template>
    </div>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-template>
      <template>
        Clear search query
      </template>
    </ais-template>`,
  }));
