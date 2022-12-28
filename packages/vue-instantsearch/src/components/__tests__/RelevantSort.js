/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import RelevantSort from '../RelevantSort.vue';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');
import '../../../test/utils/sortedHtmlSerializer';

describe('renders correctly', () => {
  test('no virtual replica', () => {
    __setState({
      isVirtualReplica: false,
      isRelevantSorted: false,
    });
    const wrapper = mount(RelevantSort);
    expect(wrapper).vueToHaveEmptyHTML();
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
  <button class="ais-RelevantSort-button"
          type="button"
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
  <button class="ais-RelevantSort-button"
          type="button"
  >
    See all results
  </button>
</div>
`);
  });
});

it("calls the connector's refine function with 0 and undefined", async () => {
  __setState({
    isRelevantSorted: true,
    isVirtualReplica: true,
    refine: jest.fn(() => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      wrapper.vm.state.isRelevantSorted = !wrapper.vm.state.isRelevantSorted;
    }),
  });

  const wrapper = mount(RelevantSort);

  const button = wrapper.find('button');

  await button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(0);

  await button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(undefined);

  await button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(0);
});
