import { mount } from '@vue/test-utils';
import InstantSearch from '../InstantSearch';
import { createWidgetMixin } from '../../mixins/widget';
import { createFakeClient } from '../../util/testutils/client';

jest.unmock('instantsearch.js/es');

it('child widgets get added to its parent instantsearch', () => {
  const widgetInstance = {
    render() {},
  };

  const ChildComponent = {
    mixins: [createWidgetMixin({ connector: () => () => widgetInstance })],

    render() {
      return null;
    },
  };

  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: createFakeClient(),
      indexName: 'something',
    },
    slots: {
      default: ChildComponent,
    },
  });

  expect(wrapper.vm.instantSearchInstance.mainIndex.getWidgets()).toContain(
    widgetInstance
  );
});
