import { mount } from '@vue/test-utils';
import QueryRuleCustomData from '../QueryRuleCustomData.vue';
import { __setState } from '../../mixins/widget';

jest.mock('../../mixins/widget');

it('renders in a list of <pre> by default', () => {
  __setState({
    items: [{ text: 'this is user data' }, { text: 'this too!' }],
  });

  const wrapper = mount(QueryRuleCustomData);

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-QueryRuleCustomData">
  <div>
    <pre>
      {
  "text": "this is user data"
}
    </pre>
  </div>
  <div>
    <pre>
      {
  "text": "this too!"
}
    </pre>
  </div>
</div>

`);
});

it('gives the items to the main slot', () => {
  const items = [{ text: 'this is user data' }, { text: 'this too!' }];
  __setState({
    items,
  });

  mount(QueryRuleCustomData, {
    scopedSlots: {
      default(props) {
        expect(props).toEqual({
          items,
        });
      },
    },
  });
});

it('gives individual items to the item slot', () => {
  const items = [{ text: 'this is user data' }, { text: 'this too!' }];
  expect.assertions(items.length);
  __setState({
    items,
  });

  mount(QueryRuleCustomData, {
    scopedSlots: {
      item(props) {
        expect(props).toEqual({
          item: expect.objectContaining({ text: expect.any(String) }),
        });
      },
    },
  });
});

it('accepts transformItems', () => {
  const transformItems = jest.fn();
  const wrapper = mount(QueryRuleCustomData, {
    propsData: {
      transformItems,
    },
  });

  expect(wrapper.vm.widgetParams).toEqual({
    transformItems,
  });
});
