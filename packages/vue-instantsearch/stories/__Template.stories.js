import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

// space before text is to make it sort last
storiesOf('  __template__', module)
  .addDecorator(previewWrapper())
  .add('simple usage', () => ({
    template: `<ais-_template></ais-_template>`,
  }))
  .add('clearing query', () => ({
    template: `<div>
      <ais-_template :clearsQuery="true"></ais-_template>
    </div>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-_template>
      <div>
        Clear search query
      </div>
    </ais-_template>`,
  }));
