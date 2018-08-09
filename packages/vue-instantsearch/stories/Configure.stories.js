import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('Configure', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: '<ais-configure></ais-configure>',
  }))
  .add('with 1 hit per page', () => ({
    template: `<div>
      <ais-configure :hitsPerPage="1"></ais-configure>
    </div>`,
  }))
  .add('external toggler', () => ({
    template: `<div>
      <ais-configure :hitsPerPage="hitsPerPage"></ais-configure>
      <button @click="toggleHitsPerPage">hitsPerPage: {{hitsPerPage}}, change</button>
    </div>`,
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
      </ais-configure>`,
  }))
  .add('with display of the parameters', () => ({
    template: `<div>
      <ais-configure :hitsPerPage="1">
        <pre slot-scope="{ searchParameters }">{{ searchParameters }}</pre>
      </ais-configure>
    </div>`,
  }));
