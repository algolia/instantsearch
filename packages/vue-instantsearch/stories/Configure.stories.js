import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Configure', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-configure></ais-configure>',
  }))
  .add('with 1 hit per page', () => ({
    template: `<div>
      <ais-configure :hitsPerPage="1"></ais-configure>
    </div>`,
  }))
  .add('toggler', () => ({
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
  }));
