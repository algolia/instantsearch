jest.unmock('instantsearch.js/es');
import { mount } from '@vue/test-utils';
import Index from '../Index';
import instantsearch from 'instantsearch.js/es';
import { createWidgetMixin } from '../../mixins/widget';
import { createFakeClient } from '../../util/testutils/client';

it('child widgets get added to their parent index', () => {
  const widgetInstance = {
    render() {},
  };

  const ChildComponent = {
    name: 'child',
    mixins: [createWidgetMixin({ connector: () => () => widgetInstance })],
    render() {
      return null;
    },
  };

  const rootAddWidgets = jest.fn();

  const wrapper = mount(Index, {
    propsData: {
      indexName: 'something',
    },
    provide() {
      return {
        $_ais_instantSearchInstance: {
          mainIndex: { addWidgets: rootAddWidgets },
        },
      };
    },
    slots: {
      default: ChildComponent,
    },
  });

  const indexWidget = wrapper.vm.widget;

  expect(indexWidget.getWidgets()).toContain(widgetInstance);

  expect(rootAddWidgets).toHaveBeenCalledTimes(1);
  expect(rootAddWidgets).toHaveBeenCalledWith([
    expect.objectContaining({ $$type: 'ais.index' }),
  ]);
});

it('child widgets render with right data', () => {
  const widgetInstance = {
    init: jest.fn(),
    render: jest.fn(),
  };

  const ChildComponent = {
    name: 'child',
    mixins: [createWidgetMixin({ connector: () => () => widgetInstance })],
    render() {
      return null;
    },
  };

  const search = instantsearch({
    indexName: 'root index',
    searchClient: createFakeClient(),
  });

  const wrapper = mount(Index, {
    propsData: {
      indexName: 'something',
    },
    provide() {
      return {
        $_ais_instantSearchInstance: search,
      };
    },
    slots: {
      default: ChildComponent,
    },
  });

  search.start();

  const indexWidget = wrapper.vm.widget;

  expect(indexWidget.getWidgets()).toContain(widgetInstance);

  expect(widgetInstance.render).not.toHaveBeenCalled();
  expect(widgetInstance.init).toHaveBeenCalledTimes(1);

  expect(widgetInstance.init).toHaveBeenCalledWith(
    expect.objectContaining({
      createURL: expect.any(Function),
      helper: expect.any(Object),
      instantSearchInstance: search,
      parent: indexWidget,
      state: expect.any(Object),
      templatesConfig: expect.any(Object),
      uiState: {},
    })
  );
});
