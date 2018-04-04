import { mount } from '@vue/test-utils';

import Template from '../__template__.vue';

jest.mock('../../component', () => ({
  data() {
    return {
      state: {
        hits: [],
        refine: jest.fn(),
      },
    };
  },
}));

describe('Template', () => {
  describe('html', () => {
    it('should render correctly', () => {
      const wrapper = mount(Template);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render correctly when `hits` is different', () => {
      const wrapper = mount(Template);
      wrapper.setData({
        state: {
          hits: ['yo', 'how', 'are', 'you', 'doing', '?'],
        },
      });
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('widgetParams', () => {
    it('correct defaults', () => {
      const wrapper = mount(Template);

      const { widgetParams } = wrapper.vm;

      expect(widgetParams).toEqual({
        someProp: [],
      });
    });

    it('allows overriding', () => {
      const wrapper = mount(Template, {
        propsData: {
          someProp: ['hi'],
        },
      });

      const { widgetParams } = wrapper.vm;

      expect(widgetParams).toEqual({
        someProp: ['hi'],
      });
    });
  });

  describe('behavior', () => {
    it('calls refine with `hi` when button is clicked', () => {
      const wrapper = mount(Template);
      const button = wrapper.find('button');
      button.trigger('click');
      expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith('hi');
    });
  });
});
