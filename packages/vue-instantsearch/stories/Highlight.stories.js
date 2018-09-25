import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('ais-highlight', module)
  .addDecorator(previewWrapper())
  .add('Existing items', () => ({
    template: `
    <div>
      <ais-hits :escape-HTML="true">
        <div slot="item" slot-scope="{ item }">
          <h2><ais-highlight attribute="name" :hit="item"></ais-highlight></h2>
          <small><ais-highlight attribute="description" :hit="item"></ais-highlight></small>
        </div>
      </ais-hits>
    </div>
  `,
  }))
  .add('Non-existing items', () => ({
    template: `
    <div>
      <ais-hits :escape-HTML="true">
        <div slot="item" slot-scope="{ item }">
          <h2><ais-highlight attribute="name" :hit="item"></ais-highlight></h2>
          <p>nose: <ais-highlight attribute="nose" :hit="item"></ais-highlight></p>
          <p>something: <ais-highlight attribute="something" :hit="item"></ais-highlight></p>
        </div>
      </ais-hits>
    </div>
    `,
  }));
