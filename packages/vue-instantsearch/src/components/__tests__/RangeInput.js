/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import RangeInput from '../RangeInput.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultRange = {
  min: 0,
  max: 1000,
};

const defaultState = {
  currentRefinement: { min: 0, max: 1000 },
  range: defaultRange,
  canRefine: true,
  refine: () => {},
};

const defaultProps = {
  attribute: 'price',
};

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    ...defaultState,
    sendEvent,
  });

  const wrapper = mount({
    components: { RangeInput },
    data() {
      return { props: defaultProps };
    },
    template: `
      <RangeInput v-bind="props">
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </RangeInput>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});
