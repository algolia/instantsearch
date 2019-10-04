import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('ais-snippet', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
    <div>
      <ais-configure
        :attributesToSnippet="['name', 'description']"
        snippetEllipsisText="[…]"
      />

      <ais-hits>
        <div slot="item" slot-scope="{ item }">
          <h2><ais-snippet attribute="name" :hit="item"></ais-snippet></h2>
          <small>
            <ais-snippet attribute="description" :hit="item"></ais-snippet>
          </small>
        </div>
      </ais-hits>
    </div>
  `,
  }))
  .add('with highlighted tag name', () => ({
    template: `
    <div>
      <ais-configure
        :attributesToSnippet="['name', 'description']"
        snippetEllipsisText="[…]"
      />

      <ais-hits>
        <div slot="item" slot-scope="{ item }">
          <h2><ais-snippet attribute="name" :hit="item"></ais-snippet></h2>
          <small>
            <ais-snippet attribute="description" :hit="item" highlighted-tag-name="span"></ais-snippet>
          </small>
        </div>
      </ais-hits>
    </div>
  `,
  }));
