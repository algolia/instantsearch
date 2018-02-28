import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CurrentRefinements from './CurrentRefinements';

Enzyme.configure({ adapter: new Adapter() });

describe('CurrentRefinements', () => {
  it('renders a list of current refinements', () =>
    expect(
      renderer
        .create(
          <CurrentRefinements
            refine={() => null}
            items={[
              {
                label: 'Genre',
                value: 'clear all genres',
              },
            ]}
            canRefine={true}
          />
        )
        .toJSON()
    ).toMatchSnapshot());

  it('allows clearing unique items of a refinement', () =>
    expect(
      renderer
        .create(
          <CurrentRefinements
            refine={() => null}
            items={[
              {
                label: 'Genre',
                value: 'clear all genres',
                items: [
                  {
                    label: 'Sci-fi',
                    value: 'clear sci-fi',
                  },
                ],
              },
            ]}
            canRefine={true}
          />
        )
        .toJSON()
    ).toMatchSnapshot());

  describe('Panel compatibility', () => {
    it('Should indicate when no more refinement', () => {
      const canRefine = jest.fn();
      const wrapper = mount(
        <CurrentRefinements
          refine={() => null}
          items={[
            {
              label: 'Genre',
              value: 'clear all genres',
              items: [
                {
                  label: 'Sci-fi',
                  value: 'clear sci-fi',
                },
              ],
            },
          ]}
          canRefine={true}
        />,
        {
          context: { canRefine },
          childContextTypes: { canRefine: PropTypes.func },
        }
      );

      expect(canRefine.mock.calls).toHaveLength(1);
      expect(canRefine.mock.calls[0][0]).toEqual(true);
      expect(
        wrapper.find('.ais-CurrentRefinements__noRefinement')
      ).toHaveLength(0);

      wrapper.setProps({ canRefine: false });

      expect(canRefine.mock.calls).toHaveLength(2);
      expect(canRefine.mock.calls[1][0]).toEqual(false);
      expect(
        wrapper.find('.ais-CurrentRefinements__noRefinement')
      ).toHaveLength(1);
    });
  });
});
