import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('ais-snippet', module)
  .addDecorator(previewWrapper())
  .add('Existing items', () => ({
    template: `
    <div>
      <ais-hits :escape-HTML="true">
        <div slot="item" slot-scope="{ item }">
          <h2><ais-snippet attribute="name" :hit="item"></ais-snippet></h2>
          <small><ais-snippet attribute="description" :hit="item"></ais-snippet></small>
        </div>
      </ais-hits>
      <ais-configure
        :attributesToSnippet="['name', 'description']"
        snippetEllipsisText="[…]"
      />
    </div>
  `,
  }))
  .add('Non-existing items', () => ({
    template: `
    <div>
      <ais-hits :escape-HTML="true">
        <div slot="item" slot-scope="{ item }">
          <h2><ais-snippet attribute="name" :hit="item"></ais-snippet></h2>
          <p>nose: <ais-snippet attribute="nose" :hit="item"></ais-snippet></p>
          <p>something: <ais-snippet attribute="something" :hit="item"></ais-snippet></p>
        </div>
      </ais-hits>
      <ais-configure
        :attributesToSnippet="['name', 'description']"
        snippetEllipsisText="[…]"
      />
    </div>
    `,
  }));
