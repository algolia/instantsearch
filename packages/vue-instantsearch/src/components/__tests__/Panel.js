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

  it('passes data without refinement', () => {
    const defaultScopedSlot = jest.fn();
    const headerScopedSlot = jest.fn();
    const footerScopedSlot = jest.fn();
    const wrapper = mount(Panel, {
      scopedSlots: {
        default: defaultScopedSlot,
        header: headerScopedSlot,
        footer: footerScopedSlot,
      },
    });

    wrapper.setData({
      canRefine: false,
    });

    expect(defaultScopedSlot).toHaveBeenCalledWith({ hasRefinements: false });
    expect(headerScopedSlot).toHaveBeenCalledWith({ hasRefinements: false });
    expect(footerScopedSlot).toHaveBeenCalledWith({ hasRefinements: false });
  });

  it('passes data with refinement', () => {
    const defaultScopedSlot = jest.fn();
    const headerScopedSlot = jest.fn();
    const footerScopedSlot = jest.fn();
    const wrapper = mount(Panel, {
      scopedSlots: {
        default: defaultScopedSlot,
        header: headerScopedSlot,
        footer: footerScopedSlot,
      },
    });

    wrapper.setData({
      canRefine: true,
    });

    expect(defaultScopedSlot).toHaveBeenCalledWith({ hasRefinements: true });
    expect(headerScopedSlot).toHaveBeenCalledWith({ hasRefinements: true });
    expect(footerScopedSlot).toHaveBeenCalledWith({ hasRefinements: true });
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
