import { mount } from '@vue/test-utils';
import Panel from '../Panel.vue';

describe('default render', () => {
  const defaultSlot = `
    <p>This is the body of the Panel.</p>
  `;

  it('renders correctly', () => {
    const wrapper = mount(Panel, {
      slots: {
        default: defaultSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    const wrapper = mount(Panel, {
      slots: {
        default: defaultSlot,
      },
    });

    wrapper.setData({
      canRefine: false,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with header', () => {
    const wrapper = mount(Panel, {
      slots: {
        default: defaultSlot,
        header: `<span>Header</span>`,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with footer', () => {
    const wrapper = mount(Panel, {
      slots: {
        default: defaultSlot,
        footer: `<span>Footer</span>`,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
