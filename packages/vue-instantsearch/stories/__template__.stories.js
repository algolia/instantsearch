import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('__template__', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-_template></ais-_template>',
  }))
  .add('clearing query', () => ({
    template: `<div>
      <ais-_template :clearsQuery="true"></ais-_template>
    </div>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-_template>
      <template>
        Clear search query
      </template>
    </ais-_template>`,
  }));
