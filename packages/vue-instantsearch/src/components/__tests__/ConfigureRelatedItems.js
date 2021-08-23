import { mount } from '../../../test/utils';
import ConfigureRelatedItems from '../ConfigureRelatedItems';

jest.mock('../../mixins/widget');

it('accepts options from props', () => {
  const props = {
    hit: { objectID: '1' },
    matchingPatterns: {},
    transformSearchParameters: x => x,
  };

  const wrapper = mount(ConfigureRelatedItems, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams).toEqual(props);
});

it('renders nothing', () => {
  const props = {
    hit: { objectID: '1' },
    matchingPatterns: {},
  };

  const wrapper = mount(ConfigureRelatedItems, {
    propsData: props,
  });

  expect(wrapper).toHaveEmptyHTML();
});
