import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Results', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: `
      <ais-results />
    `,
  }))
  .add('header & footer', () => ({
    template: `
      <ais-results>
        <div slot="header">--- Header ---</div>
        <div slot="footer">--- Footer ---</div>
      </ais-results>
    `,
  }))
  .add('with index', () => ({
    template: `
      <ais-results>
        <div slot-scope="{ result, index }">
          {{index + 1}}. {{result.objectID}}
        </div>
      </ais-results>
    `,
  }))
  .add('all slots', () => ({
    template: `
      <ais-results>
      <div slot="header">--- Header ---</div>
      <div slot-scope="{ result, index }">
        {{index + 1}}. {{result.objectID}}
      </div>
      <div slot="footer">--- Footer ---</div>
      </ais-results>
    `,
  }));
