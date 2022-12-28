/**
 * @jest-environment jsdom
 */

jest.unmock('instantsearch.js/es');
import { mount } from '../../../test/utils';
import Index from '../Index';
import instantsearch from 'instantsearch.js/es';
import { createWidgetMixin } from '../../mixins/widget';
import { createFakeClient } from '../../util/testutils/client';
import '../../../test/utils/sortedHtmlSerializer';

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

  const wrapper = mount({
    components: { Index, ChildComponent },
    data() {
      return { props: { indexName: 'something' } };
    },
    provide: {
      $_ais_instantSearchInstance: {
        mainIndex: { addWidgets: rootAddWidgets },
      },
    },
    template: `
      <Index v-bind="props">
        <ChildComponent />
      </Index>
    `,
  });

  const indexWidget = wrapper.findComponent(Index).vm.widget;
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

  const wrapper = mount({
    components: { Index, ChildComponent },
    data() {
      return { props: { indexName: 'something' } };
    },
    provide: {
      $_ais_instantSearchInstance: search,
    },
    template: `
      <Index v-bind="props">
        <ChildComponent />
      </Index>
    `,
  });

  search.start();

  const indexWidget = wrapper.findComponent(Index).vm.widget;

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
