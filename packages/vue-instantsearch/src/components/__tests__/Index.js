import Vue from 'vue';
import { mount } from '@vue/test-utils';
import Index from '../Index';
import { __setWidget } from '../../mixins/widget';
jest.mock('../../mixins/widget');

beforeEach(() => {
  jest.resetAllMocks();
});

it('passes props to widgetParams', () => {
  const wrapper = mount(Index, {
    propsData: {
      indexName: 'the name',
      indexId: 'the id',
    },
  });

  expect(wrapper.vm.widgetParams).toEqual({
    indexName: 'the name',
    indexId: 'the id',
  });
});

it('renders just a div by default', () => {
  const wrapper = mount(Index, {
    propsData: {
      indexName: 'index name',
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div>
</div>

`);
});

it('renders its children', () => {
  const wrapper = mount(Index, {
    propsData: {
      indexName: 'index name',
    },
    slots: {
      default: '<div>hi there!</div>',
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div>
  <div>
    hi there!
  </div>
</div>

`);
});

it('provides the index widget', done => {
  Vue.config.errorHandler = done;

  const indexWidget = { $$type: 'ais.index' };
  __setWidget(indexWidget);

  const ChildComponent = {
    inject: ['$_ais_getParentIndex'],
    mounted() {
      this.$nextTick(() => {
        expect(typeof this.$_ais_getParentIndex).toBe('function');
        expect(this.$_ais_getParentIndex()).toBe(indexWidget);
        done();
      });
    },
    render() {
      return null;
    },
  };

  mount(Index, {
    propsData: {
      indexName: 'something',
      widget: indexWidget,
    },
    slots: {
      default: ChildComponent,
    },
  });
});
