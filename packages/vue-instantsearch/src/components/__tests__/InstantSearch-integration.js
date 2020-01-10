import { mount } from '@vue/test-utils';
import InstantSearch from '../InstantSearch';
import { createWidgetMixin } from '../../mixins/widget';

it('child widgets get added to its parent instantsearch', () => {
  const widgetInstance = {};

  const ChildComponent = {
    mixins: [createWidgetMixin({ connector: () => () => widgetInstance })],

    render() {
      return null;
    },
  };

  const wrapper = mount(InstantSearch, {
    propsData: {
      searchClient: {},
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
