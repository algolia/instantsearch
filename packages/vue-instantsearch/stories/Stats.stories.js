import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Stats', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-stats></ais-stats>',
  }))
  .add('custom display', () => ({
    template: `
    <ais-stats>
      <div slot-scope="{ totalResults, processingTime, query }">
        {{ totalResults.toLocaleString() }} results found in {{ processingTime }}ms for query "<b>{{ query }}</b>" 🚀.
      </div>
    </ais-stats>
    `,
  }));
