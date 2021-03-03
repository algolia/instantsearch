import { mount } from '@vue/test-utils';
import RelevantSort from '../RelevantSort.vue';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');

describe('renders correctly', () => {
  test('no virtual replica', () => {
    __setState({
      isVirtualReplica: false,
      isRelevantSorted: false,
    });
    const wrapper = mount(RelevantSort);
    expect(wrapper.html()).toMatchInlineSnapshot(`undefined`);
  });

  test('not relevant sorted', () => {
    __setState({
      isVirtualReplica: true,
      isRelevantSorted: false,
    });
    const wrapper = mount(RelevantSort);
    expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-RelevantSort">
  <div class="ais-RelevantSort-text">
  </div>
  <button type="button"
          class="ais-RelevantSort-button"
  >
    See relevant results
  </button>
</div>

`);
  });

  test('relevant sorted', () => {
    __setState({
      isVirtualReplica: true,
      isRelevantSorted: true,
    });
    const wrapper = mount(RelevantSort);
    expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-RelevantSort">
  <div class="ais-RelevantSort-text">
  </div>
  <button type="button"
          class="ais-RelevantSort-button"
  >
    See all results
  </button>
</div>

`);
  });
});

it("calls the connector's refine function with 0 and undefined", () => {
  __setState({
    isRelevantSorted: true,
    isVirtualReplica: true,
    refine: jest.fn(() => {
      wrapper.vm.state.isRelevantSorted = !wrapper.vm.state.isRelevantSorted;
    }),
  });

  const wrapper = mount(RelevantSort);

  const button = wrapper.find('button');

  button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(0);

  button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(undefined);

  button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(0);
});
