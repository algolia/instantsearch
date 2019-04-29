import { mount } from '@vue/test-utils';
import QueryRuleContext from '../QueryRuleContext';
import { __setState } from '../../mixins/widget';

jest.mock('../../mixins/widget');

it('is renderless', () => {
  __setState({
    items: ["this isn't used"],
  });
  const wrapper = mount(QueryRuleContext, {
    propsData: {
      trackedFilters: {},
    },
  });
  expect(wrapper.text()).toMatchInlineSnapshot(`""`);
});

it('accepts only trackedFilters and transformRuleContexts', () => {
  const trackedFilters = {};
  const transformRuleContexts = jest.fn();
  const wrapper = mount(QueryRuleContext, {
    propsData: {
      trackedFilters,
      transformRuleContexts,
      transformItems: "won't be transferred",
    },
  });

  expect(wrapper.vm.widgetParams).toEqual({
    trackedFilters,
    transformRuleContexts,
  });
});
