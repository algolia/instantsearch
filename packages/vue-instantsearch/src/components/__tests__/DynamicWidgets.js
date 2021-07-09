import { createLocalVue, mount } from '@vue/test-utils';
import DynamicWidgets from '../DynamicWidgets';
import { __setState } from '../../mixins/widget';
import { plugin } from '../../plugin';
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
  const localVue = createLocalVue();

  localVue.use(plugin);

  __setState(null);

  const wrapper = mount(DynamicWidgets, {
    localVue,
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
    stubs: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
      'ais-hierarchical-menu': MockHierarchicalMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div hidden="hidden"
     class="ais-DynamicWidgets"
>
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-refinement-list"
         attribute="test1"
    >
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-menu"
         attribute="test2"
    >
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div widget-name="ais-hierarchical-menu"
             attributes="test3,test4"
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
  const localVue = createLocalVue();

  localVue.use(plugin);

  __setState({
    attributesToRender: [],
  });

  const wrapper = mount(DynamicWidgets, {
    localVue,
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `<ais-refinement-list attribute="test1"/>`,
    },
    stubs: {
      'ais-refinement-list': MockRefinementList,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
</div>

`);
});

it('renders attributesToRender (menu)', () => {
  const localVue = createLocalVue();

  localVue.use(plugin);

  __setState({
    attributesToRender: ['test1'],
  });

  const wrapper = mount(DynamicWidgets, {
    localVue,
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
        <ais-menu attribute="test1" />
        <ais-refinement-list attribute="test2" />
      `,
    },
    stubs: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-menu"
         attribute="test1"
    >
    </div>
  </div>
</div>

`);
});

it('renders attributesToRender (refinement list)', () => {
  const localVue = createLocalVue();

  localVue.use(plugin);

  __setState({
    attributesToRender: ['test2'],
  });

  const wrapper = mount(DynamicWidgets, {
    localVue,
    propsData: {
      transformItems: items => items,
    },
    slots: {
      default: `
        <ais-menu attribute="test1" />
        <ais-refinement-list attribute="test2" />
      `,
    },
    stubs: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-refinement-list"
         attribute="test2"
    >
    </div>
  </div>
</div>

`);
});

it('renders attributesToRender (panel)', () => {
  const localVue = createLocalVue();

  localVue.use(plugin);

  __setState({
    attributesToRender: ['test2'],
  });

  const wrapper = mount(DynamicWidgets, {
    localVue,
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
    stubs: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div widget-name="ais-refinement-list"
             attribute="test2"
        >
        </div>
      </div>
    </div>
  </div>
</div>

`);
});

it('renders attributesToRender (hierarchical menu)', () => {
  const localVue = createLocalVue();

  localVue.use(plugin);

  __setState({
    attributesToRender: ['test1'],
  });

  const wrapper = mount(DynamicWidgets, {
    localVue,
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
    stubs: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
      'ais-hierarchical-menu': MockHierarchicalMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-hierarchical-menu"
         attributes="test1,test2"
    >
    </div>
  </div>
</div>

`);
});

it('updates DOM when attributesToRender changes', () => {
  const localVue = createLocalVue();

  localVue.use(plugin);

  let attributesToRender = ['test1'];

  __setState({
    get attributesToRender() {
      return attributesToRender;
    },
  });

  const wrapper = mount(DynamicWidgets, {
    localVue,
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
    stubs: {
      'ais-refinement-list': MockRefinementList,
      'ais-menu': MockMenu,
      'ais-hierarchical-menu': MockHierarchicalMenu,
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-hierarchical-menu"
         attributes="test1,test2"
    >
    </div>
  </div>
</div>

`);

  attributesToRender = ['test3'];

  wrapper.vm.$forceUpdate();

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-menu"
         attribute="test3"
    >
    </div>
  </div>
</div>

`);

  attributesToRender = ['test1', 'test4'];

  wrapper.vm.$forceUpdate();

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
  <div class="ais-DynamicWidgets-widget">
    <div widget-name="ais-hierarchical-menu"
         attributes="test1,test2"
    >
    </div>
  </div>
  <div class="ais-DynamicWidgets-widget">
    <div class="ais-Panel">
      <div class="ais-Panel-body">
        <div widget-name="ais-refinement-list"
             attribute="test4"
        >
        </div>
      </div>
    </div>
  </div>
</div>

`);

  attributesToRender = [];

  wrapper.vm.$forceUpdate();

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-DynamicWidgets">
</div>

`);
});
