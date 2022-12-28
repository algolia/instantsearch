/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import Index from '../Index';
import { __setWidget } from '../../mixins/widget';
import { Vue2, isVue3, isVue2 } from '../../util/vue-compat';
jest.mock('../../mixins/widget');
import '../../../test/utils/sortedHtmlSerializer';

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

// eslint-disable-next-line jest/no-done-callback
it('provides the index widget', (done) => {
  const indexWidget = { $$type: 'ais.index' };
  __setWidget(indexWidget);

  const ChildComponent = {
    inject: ['$_ais_getParentIndex'],
    mounted() {
      this.$nextTick(() => {
        expect(typeof this.$_ais_getParentIndex).toBe('function');
        expect(this.$_ais_getParentIndex()).toEqual(indexWidget);
        done();
      });
    },
    render() {
      return null;
    },
  };

  if (isVue2) {
    Vue2.config.errorHandler = done;
  }

  mount(
    {
      components: { Index, ChildComponent },
      template: `
      <Index index-name="something">
        <ChildComponent />
      </Index>
    `,
    },
    isVue3 && {
      global: {
        config: {
          errorHandler: done,
        },
      },
    }
  );
});
