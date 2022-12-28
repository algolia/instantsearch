/**
 * @jest-environment jsdom
 */

import { mount, nextTick } from '../../../test/utils';
import DynamicWidgets from '../DynamicWidgets';
import { __setState } from '../../mixins/widget';
import { AisPanel } from '../../widgets';
jest.mock('../../mixins/widget');
import '../../../test/utils/sortedHtmlSerializer';

const MockRefinementList = {
  props: { attribute: { type: String } },
  template: `
    <div>
      {{
        JSON.stringify({
          widgetName: "ais-refinement-list",
          attribute,
        }, null, 2)
      }}
    </div>
  `,
};

const MockMenu = {
  props: { attribute: { type: String } },
  template: `
    <div>
      {{
        JSON.stringify({
          widgetName: "ais-menu",
          attribute,
        }, null, 2)
      }}
    </div>
  `,
};

const MockHierarchicalMenu = {
  props: { attributes: { type: Array } },
  template: `
    <div>
      {{
        JSON.stringify({
          widgetName: "ais-hierarchical-menu",
          attributes
        }, null, 2)
      }}
    </div>
  `,
};

it('passes arguments to connector', () => {
  __setState(null);

  const transformItems = (items) => items;
  const facets = ['test'];
  const maxValuesPerFacet = 100;
  const wrapper = mount({
    data() {
      return { props: { transformItems, facets, maxValuesPerFacet } };
    },
    template: `
      <DynamicWidgets v-bind="props">
        <MockRefinementList attribute="test1"/>
        <MockMenu attribute="test2"/>
        <AisPanel>
          <MockHierarchicalMenu :attributes="['test3', 'test4']" />
        </AisPanel>
      </DynamicWidgets>
      `,
    components: {
      DynamicWidgets,
      MockRefinementList,
      MockMenu,
      MockHierarchicalMenu,
      AisPanel,
    },
  });

  const dynamicWidgets = wrapper.findComponent(DynamicWidgets);

  expect(dynamicWidgets.props()).toEqual({
    classNames: undefined,
    transformItems,
    facets: ['test'],
    maxValuesPerFacet: 100,
  });

  expect(dynamicWidgets.vm.widgetParams).toEqual({
    transformItems,
    facets: ['test'],
    maxValuesPerFacet: 100,
    widgets: [],
  });
});

it('renders all children without state', () => {
  __setState(null);

  const wrapper = mount({
    data() {
      return { props: { transformItems: (items) => items } };
    },
    template: `
      <DynamicWidgets v-bind="props">
        <MockRefinementList attribute="test1"/>
        <MockMenu attribute="test2"/>
        <AisPanel>
          <MockHierarchicalMenu :attributes="['test3', 'test4']" />
        </AisPanel>
      </DynamicWidgets>
      `,
    components: {
      DynamicWidgets,
      MockRefinementList,
      MockMenu,
      MockHierarchicalMenu,
      AisPanel,
    },
  });

  expect(wrapper.htmlCompat()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets"
     hidden="hidden"
>
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-refinement-list",
      "attribute": "test1"
      }
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-menu",
      "attribute": "test2"
      }
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div>
          {
          "widgetName": "ais-hierarchical-menu",
          "attributes": [
          "test3",
          "test4"
          ]
          }
        </div>
      </div>
    </div>
  </div>
</div>
`);
});

it('renders nothing without children', () => {
  __setState({
    attributesToRender: ['something-that-does-not-show'],
  });

  const wrapper = mount(DynamicWidgets, {
    propsData: {
      transformItems: (items) => items,
    },
  });
  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
</div>
`);
});

it('renders nothing with empty attributesToRender', () => {
  __setState({
    attributesToRender: [],
  });

  const wrapper = mount(DynamicWidgets, {
    template: `
      <DynamicWidgets :transformItems="items => items">
        <MockRefinementList attribute="test1" />
      </DynamicWidgets>
    `,
    components: {
      DynamicWidgets,
      MockRefinementList,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
</div>
`);
});

it('renders attributesToRender (menu)', () => {
  __setState({
    attributesToRender: ['test1'],
  });

  const wrapper = mount({
    template: `
      <DynamicWidgets :transformItems="items => items">
        <MockMenu attribute="test1" />
        <MockRefinementList attribute="test2" />
      </DynamicWidgets>
    `,
    components: {
      DynamicWidgets,
      MockRefinementList,
      MockMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-menu",
      "attribute": "test1"
      }
    </div>
  </div>
</div>
`);
});

it('renders attributesToRender (refinement list)', () => {
  __setState({
    attributesToRender: ['test2'],
  });

  const wrapper = mount({
    template: `
      <DynamicWidgets :transformItems="items => items">
        <MockMenu attribute="test1" />
        <MockRefinementList attribute="test2" />
      </DynamicWidgets>
    `,
    components: {
      DynamicWidgets,
      MockRefinementList,
      MockMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-refinement-list",
      "attribute": "test2"
      }
    </div>
  </div>
</div>
`);
});

it('renders attributesToRender (panel)', () => {
  __setState({
    attributesToRender: ['test2'],
  });

  const wrapper = mount({
    template: `
      <DynamicWidgets :transformItems="items => items">
        <MockMenu attribute="test1" />
        <AisPanel>
          <MockRefinementList attribute="test2" />
        </AisPanel>
      </DynamicWidgets>
    `,
    components: {
      DynamicWidgets,
      MockRefinementList,
      MockMenu,
      AisPanel,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div>
          {
          "widgetName": "ais-refinement-list",
          "attribute": "test2"
          }
        </div>
      </div>
    </div>
  </div>
</div>
`);
});

it('renders attributesToRender (hierarchical menu)', () => {
  __setState({
    attributesToRender: ['test1'],
  });

  const wrapper = mount({
    template: `
      <DynamicWidgets :transformItems="items => items">
        <MockHierarchicalMenu :attributes="['test1','test2']" />
        <MockMenu attribute="test3" />
        <AisPanel>
          <MockRefinementList attribute="test4" />
        </AisPanel>
      </DynamicWidgets>
    `,
    components: {
      DynamicWidgets,
      MockRefinementList,
      MockMenu,
      MockHierarchicalMenu,
      AisPanel,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-hierarchical-menu",
      "attributes": [
      "test1",
      "test2"
      ]
      }
    </div>
  </div>
</div>
`);
});

it('updates DOM when attributesToRender changes', async () => {
  let attributesToRender = ['test1'];

  __setState({
    get attributesToRender() {
      return attributesToRender;
    },
  });

  const wrapper = mount({
    template: `
      <DynamicWidgets :transformItems="items => items">
        <MockHierarchicalMenu :attributes="['test1','test2']" />
        <MockMenu attribute="test3" />
        <AisPanel>
          <MockRefinementList attribute="test4" />
        </AisPanel>
      </DynamicWidgets>
    `,
    components: {
      DynamicWidgets,
      MockRefinementList,
      MockMenu,
      MockHierarchicalMenu,
      AisPanel,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-hierarchical-menu",
      "attributes": [
      "test1",
      "test2"
      ]
      }
    </div>
  </div>
</div>
`);

  attributesToRender = ['test3'];
  wrapper.vm.$forceUpdate();
  await nextTick();

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-menu",
      "attribute": "test3"
      }
    </div>
  </div>
</div>
`);

  attributesToRender = ['test1', 'test4'];
  wrapper.vm.$forceUpdate();
  await nextTick();

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div>
      {
      "widgetName": "ais-hierarchical-menu",
      "attributes": [
      "test1",
      "test2"
      ]
      }
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div>
          {
          "widgetName": "ais-refinement-list",
          "attribute": "test4"
          }
        </div>
      </div>
    </div>
  </div>
</div>
`);

  attributesToRender = [];
  wrapper.vm.$forceUpdate();
  await nextTick();

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
</div>
`);
});
