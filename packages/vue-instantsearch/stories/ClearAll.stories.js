import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('ClearAll', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-clear-all></ais-clear-all>',
  }))
  .add('clearing query', () => ({
    template: `<div>
      <ais-clear-all :clearsQuery="true"></ais-clear-all>
      <span>TIP: type something first</span>
    </div>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-clear-all>
      <template>
        Clear search query
      </template>
    </ais-clear-all>`,
  }))
  .add('toggler', () => ({
    template: `<div>
      <ais-clear-all :clearsQuery="clearsQuery"></ais-clear-all>
      <button @click="toggleClearsQuery">clearsQuery: {{clearsQuery}}, change</button>
    </div>`,
    data() {
      return { clearsQuery: false };
    },
    methods: {
      toggleClearsQuery() {
        this.clearsQuery = !this.clearsQuery;
      },
    },
  }));
