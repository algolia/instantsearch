import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('ClearRefinements', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-clear-refinements></ais-clear-refinements>',
  }))
  .add('clearing query', () => ({
    template: `<div>
      <ais-clear-refinements :clearsQuery="true"></ais-clear-refinements>
      <span>TIP: type something first</span>
    </div>`,
  }))
  .add('custom rendering', () => ({
    template: `<ais-clear-refinements :clearsQuery="true">
      <template>
        Clear search query
      </template>
    </ais-clear-refinements>`,
  }))
  .add('toggler', () => ({
    template: `<div>
      <ais-clear-refinements :clearsQuery="clearsQuery"></ais-clear-refinements>
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
