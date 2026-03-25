/**
 * @vitest-environment happy-dom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import RatingMenu from '../RatingMenu.vue';
import '../../../test/utils/sortedHtmlSerializer';

vi.mock('../../mixins/widget');
vi.mock('../../mixins/panel');

const defaultProps = {
  attribute: 'popularity',
};

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = vi.fn();
  __setState({
    createURL: () => '#',
    items: [],
    sendEvent,
  });

  const wrapper = mount({
    components: { RatingMenu },
    data() {
      return { props: defaultProps };
    },
    template: `
      <RatingMenu v-bind="props">
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </RatingMenu>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});
