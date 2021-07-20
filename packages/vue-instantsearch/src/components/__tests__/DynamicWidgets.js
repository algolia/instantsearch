import { mount } from '../../../test/utils';
import DynamicWidgets from '../DynamicWidgets';
import { __setState } from '../../mixins/widget';
import { AisPanel } from '../../widgets';
jest.mock('../../mixins/widget');

const MockRefinementList = {
  props: { attribute: { type: String } },
  render(h) {
    return h('div', {
      attrs: {
        'widget-name': 'ais-refinement-list',
        attribute: this.attribute,
      },
    });
  },
};

const MockMenu = {
  props: { attribute: { type: String } },
  render(h) {
    return h('div', {
      attrs: { 'widget-name': 'ais-menu', attribute: this.attribute },
    });
  },
};

const MockHierarchicalMenu = {
  props: { attributes: { type: Array } },
  render(h) {
    return h('div', {
      attrs: {
        'widget-name': 'ais-hierarchical-menu',
        attributes: this.attributes,
      },
    });
  },
};

it('renders all children without state', () => {
  __setState(null);

  const wrapper = mount(DynamicWidgets, {
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
      <ais-refinement-list attribute="test1"/>
      <ais-menu attribute="test2"/>
      <ais-panel>
        <ais-hierarchical-menu :attributes="['test3', 'test4']" />
      </ais-panel>
      `,
    },
    components: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
      'ais-hierarchical-menu': MockHierarchicalMenu,
      AisPanel,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets"
     hidden="hidden"
>
  <div class="ais-DynamicWidgets-widget">
    <div attribute="test1"
         widget-name="ais-refinement-list"
    >
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div attribute="test2"
         widget-name="ais-menu"
    >
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div attributes="test3,test4"
             widget-name="ais-hierarchical-menu"
        >
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
      transformItems: items => items,
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
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `<ais-refinement-list attribute="test1"/>`,
    },
    components: {
      'ais-refinement-list': MockRefinementList,
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

  const wrapper = mount(DynamicWidgets, {
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
        <ais-menu attribute="test1" />
        <ais-refinement-list attribute="test2" />
      `,
    },
    components: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div attribute="test1"
         widget-name="ais-menu"
    >
    </div>
  </div>
</div>
`);
});

it('renders attributesToRender (refinement list)', () => {
  __setState({
    attributesToRender: ['test2'],
  });

  const wrapper = mount(DynamicWidgets, {
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
        <ais-menu attribute="test1" />
        <ais-refinement-list attribute="test2" />
      `,
    },
    components: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div attribute="test2"
         widget-name="ais-refinement-list"
    >
    </div>
  </div>
</div>
`);
});

it('renders attributesToRender (panel)', () => {
  __setState({
    attributesToRender: ['test2'],
  });

  const wrapper = mount(DynamicWidgets, {
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
        <ais-menu attribute="test1" />
        <ais-panel>
          <ais-refinement-list attribute="test2" />
        </ais-panel>
      `,
    },
    components: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
      AisPanel,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div attribute="test2"
             widget-name="ais-refinement-list"
        >
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

  const wrapper = mount(DynamicWidgets, {
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
        <ais-hierarchical-menu :attributes="['test1','test2']" />
        <ais-menu attribute="test3" />
        <ais-panel>
          <ais-refinement-list attribute="test4" />
        </ais-panel>
      `,
    },
    components: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
      'ais-hierarchical-menu': MockHierarchicalMenu,
      AisPanel,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div attributes="test1,test2"
         widget-name="ais-hierarchical-menu"
    >
    </div>
  </div>
</div>
`);
});

it('updates DOM when attributesToRender changes', async () => {
  const attributesToRender = ['test1'];

  __setState({
    attributesToRender,
  });

  const wrapper = mount(DynamicWidgets, {
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
        <ais-hierarchical-menu :attributes="['test1','test2']" />
        <ais-menu attribute="test3" />
        <ais-panel>
          <ais-refinement-list attribute="test4" />
        </ais-panel>
      `,
    },
    components: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
      'ais-hierarchical-menu': MockHierarchicalMenu,
      AisPanel,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div attributes="test1,test2"
         widget-name="ais-hierarchical-menu"
    >
    </div>
  </div>
</div>
`);

  await wrapper.setData({ state: { attributesToRender: ['test3'] } });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div attribute="test3"
         widget-name="ais-menu"
    >
    </div>
  </div>
</div>
`);

  await wrapper.setData({ state: { attributesToRender: ['test1', 'test4'] } });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div attributes="test1,test2"
         widget-name="ais-hierarchical-menu"
    >
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div attribute="test4"
             widget-name="ais-refinement-list"
        >
        </div>
      </div>
    </div>
  </div>
</div>
`);

  await wrapper.setData({ state: { attributesToRender: [] } });

  expect(wrapper.html()).toMatchInlineSnapshot(`
<div class="ais-DynamicWidgets">
</div>
`);
});
