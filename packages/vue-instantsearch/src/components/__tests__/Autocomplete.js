/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import Autocomplete from '../Autocomplete.vue';
import { __setState } from '../../mixins/widget';
import '../../../test/utils/sortedHtmlSerializer';
jest.mock('../../mixins/widget');

const defaultState = {
  refine: jest.fn(),
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

// eslint-disable-next-line jest/no-done-callback
it('gives the correct props to the default slot', (done) => {
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
