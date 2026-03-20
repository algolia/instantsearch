/**
 * @vitest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Autocomplete from '../Autocomplete.vue';
import '../../../test/utils/sortedHtmlSerializer';
vi.mock('../../mixins/widget');

const defaultState = {
  refine: vi.fn(),
  currentRefinement: '',
  indices: [
    {
      index: 'bla',
      label: 'bla bla bla ',
      hits: [{ objectID: 1, name: 'hi' }],
      results: {},
    },
  ],
};

it('renders correctly', () => {
  __setState({
    ...defaultState,
  });
  const wrapper = mount(Autocomplete);

  expect(wrapper.html()).toMatchSnapshot();
});

it('gives the correct props to the default slot', () => {
  return new Promise((done) => {
    __setState({
      ...defaultState,
    });
    mount(Autocomplete, {
      scopedSlots: {
        default(props) {
          expect(props).toEqual(
            expect.objectContaining({
              currentRefinement: defaultState.currentRefinement,
              refine: defaultState.refine,
              indices: defaultState.indices,
            })
          );
          done();
        },
      },
    });
  });
});
