import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';
import { withKnobs, object } from '@storybook/addon-knobs/vue';

storiesOf('ais-configure', module)
  .addDecorator(previewWrapper())
  .addDecorator(withKnobs)
  .add('default', () => ({
    template: `
      <ais-configure />
    `,
  }))
  .add('with 1 hit per page', () => ({
    template: `
      <ais-configure :hitsPerPage="1" />
    `,
  }))
  .add('external toggler', () => ({
    template: `
      <div>
        <ais-configure :hitsPerPage="hitsPerPage" />
        <button @click="toggleHitsPerPage">hitsPerPage: {{hitsPerPage}}, change</button>
      </div>
    `,
    data() {
      return { hitsPerPage: 1 };
    },
    methods: {
      toggleHitsPerPage() {
        this.hitsPerPage = this.hitsPerPage === 1 ? 5 : 1;
      },
    },
  }))
  .add('inline toggler', () => ({
    template: `
      <ais-configure :hitsPerPage="1">
        <template slot-scope="{ searchParameters, refine }">
          <pre>{{JSON.stringify(searchParameters, null, 2)}}</pre>
          <button @click="refine({hitsPerPage: searchParameters.hitsPerPage === 1 ? 5 : 1})">
            hitsPerPage: {{searchParameters.hitsPerPage}}, change
          </button>
        </template>
      </ais-configure>
    `,
  }))
  .add('with display of the parameters', () => ({
    template: `
      <ais-configure :hitsPerPage="1">
        <pre slot-scope="{ searchParameters }">{{JSON.stringify(searchParameters, null, 2)}}</pre>
      </ais-configure>
    `,
  }))
  .add('playground', () => ({
    template: `
      <ais-configure v-bind="knobs">
        <pre slot-scope="{ searchParameters }">{{ searchParameters }}</pre>
      </ais-configure>
    `,
    data() {
      return {
        knobs: object('search parameters', {
          hitsPerPage: 1,
        }),
      };
    },
  }));
