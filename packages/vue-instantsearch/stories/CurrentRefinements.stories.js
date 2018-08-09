import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('CurrentRefinements', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: '<ais-current-refinements></ais-current-refinements>',
  }))
  .add('with a refinement to clear', () => ({
    template: `<div>
      <ais-current-refinements :clearsQuery="true"></ais-current-refinements>
      <ais-menu attribute="brand"></ais-menu>
    </div>`,
  }));
