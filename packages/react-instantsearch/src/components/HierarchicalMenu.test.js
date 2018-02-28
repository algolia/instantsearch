import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import HierarchicalMenu from './HierarchicalMenu';

Enzyme.configure({ adapter: new Adapter() });

describe('HierarchicalMenu', () => {
  it('default hierarchical menu', () => {
    const tree = renderer
      .create(
        <HierarchicalMenu
          refine={() => null}
          createURL={() => '#'}
          items={[
            {
              value: 'white',
              count: 10,
              label: 'white',
              items: [
                { value: 'white1', label: 'white1', count: 3 },
                { value: 'white2', label: 'white2', count: 4 },
              ],
            },
            { value: 'black', count: 20, label: 'black' },
            { value: 'blue', count: 30, label: 'blue' },
          ]}
          limitMin={2}
          limitMax={4}
          showMore={true}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer
      .create(
        <HierarchicalMenu
          refine={() => null}
          createURL={() => '#'}
          items={[
            {
              value: 'white',
              count: 10,
              label: 'white',
              items: [
                { value: 'white1', label: 'white1', count: 3 },
                { value: 'white2', label: 'white2', count: 4 },
              ],
            },
            { value: 'black', count: 20, label: 'black' },
            { value: 'blue', count: 30, label: 'blue' },
          ]}
          translations={{
            showMore: ' display more',
          }}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HierarchicalMenu
        refine={refine}
        createURL={() => '#'}
        items={[
          {
            value: 'white',
            count: 10,
            label: 'white',
            items: [
              { value: 'white1', label: 'white1', count: 3 },
              { value: 'white2', label: 'white2', count: 4 },
            ],
          },
          { value: 'black', count: 20, label: 'black' },
          { value: 'blue', count: 30, label: 'blue' },
        ]}
        canRefine={true}
      />
    );

    const itemParent = wrapper.find(
      '.ais-HierarchicalMenu__item .ais-HierarchicalMenu__itemParent'
    );

    expect(itemParent).toHaveLength(1);

    itemParent
      .find('.ais-HierarchicalMenu__itemLink')
      .first()
      .simulate('click');
    expect(refine.mock.calls).toHaveLength(1);
    expect(refine.mock.calls[0][0]).toEqual('white');

    wrapper.unmount();
  });

  it('should respect defined limits', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HierarchicalMenu
        refine={refine}
        createURL={() => '#'}
        items={[
          { value: 'white', count: 10, label: 'white' },
          { value: 'black', count: 20, label: 'black' },
          { value: 'blue', count: 30, label: 'blue' },
          { value: 'green', count: 30, label: 'green' },
          { value: 'cyan', count: 30, label: 'cyan' },
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        canRefine={true}
      />
    );

    const items = wrapper.find('.ais-HierarchicalMenu__item');

    expect(items).toHaveLength(2);

    wrapper.find('.ais-HierarchicalMenu__showMore').simulate('click');

    expect(wrapper.find('.ais-HierarchicalMenu__item')).toHaveLength(4);

    wrapper.unmount();
  });

  it('should disabled show more when no more item to display', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <HierarchicalMenu
        refine={refine}
        createURL={() => '#'}
        items={[
          { value: 'white', count: 10, label: 'white' },
          { value: 'black', count: 20, label: 'black' },
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        canRefine={true}
      />
    );

    const items = wrapper.find('.ais-HierarchicalMenu__item');

    expect(items).toHaveLength(2);

    expect(
      wrapper.find('.ais-HierarchicalMenu__showMoreDisabled')
    ).toBeDefined();

    wrapper.unmount();
  });

  describe('Panel compatibility', () => {
    it('Should indicate when no more refinement', () => {
      const canRefine = jest.fn();
      const wrapper = mount(
        <HierarchicalMenu
          refine={() => null}
          createURL={() => '#'}
          items={[
            {
              value: 'white',
              count: 10,
              label: 'white',
              items: [
                { value: 'white1', label: 'white1', count: 3 },
                { value: 'white2', label: 'white2', count: 4 },
              ],
            },
            { value: 'black', count: 20, label: 'black' },
            { value: 'blue', count: 30, label: 'blue' },
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
      expect(wrapper.find('.ais-HierarchicalMenu__noRefinement')).toHaveLength(
        0
      );

      wrapper.setProps({ canRefine: false });

      expect(canRefine.mock.calls).toHaveLength(2);
      expect(canRefine.mock.calls[1][0]).toEqual(false);
      expect(wrapper.find('.ais-HierarchicalMenu__noRefinement')).toHaveLength(
        1
      );
    });
  });
});
