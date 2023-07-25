/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';

import Link from '../Link';
import Menu from '../Menu';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../../widgets/Highlight', () => () => null);

describe('Menu', () => {
  it('default menu', () => {
    const tree = renderer
      .create(
        <Menu
          refine={() => null}
          searchForItems={() => null}
          createURL={() => '#'}
          items={[
            { label: 'white', value: 'white', count: 10, isRefined: false },
            { label: 'black', value: 'black', count: 20, isRefined: false },
            { label: 'blue', value: 'blue', count: 30, isRefined: false },
            { label: 'green', value: 'green', count: 30, isRefined: false },
            { label: 'red', value: 'red', count: 30, isRefined: false },
          ]}
          limit={2}
          showMoreLimit={4}
          showMore={true}
          isFromSearch={false}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('default menu with custom className', () => {
    const tree = renderer
      .create(
        <Menu
          className="MyCustomMenu"
          refine={() => null}
          searchForItems={() => null}
          createURL={() => '#'}
          items={[
            { label: 'white', value: 'white', count: 10, isRefined: false },
            { label: 'black', value: 'black', count: 20, isRefined: false },
            { label: 'blue', value: 'blue', count: 30, isRefined: false },
            { label: 'green', value: 'green', count: 30, isRefined: false },
            { label: 'red', value: 'red', count: 30, isRefined: false },
          ]}
          limit={2}
          showMoreLimit={4}
          showMore={true}
          isFromSearch={false}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu with search inside items but no search results', () => {
    const tree = renderer
      .create(
        <Menu
          refine={() => null}
          searchForItems={() => null}
          searchable
          createURL={() => '#'}
          items={[
            { label: 'white', value: 'white', count: 10, isRefined: true },
            { label: 'black', value: 'black', count: 20, isRefined: false },
            { label: 'blue', value: 'blue', count: 30, isRefined: false },
          ]}
          isFromSearch={false}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu with search inside items with search results', () => {
    const tree = renderer
      .create(
        <Menu
          refine={() => null}
          searchForItems={() => null}
          searchable
          createURL={() => '#'}
          items={[
            {
              label: 'white',
              value: 'white',
              count: 10,
              isRefined: true,
              _highlightResult: { label: 'white' },
            },
          ]}
          isFromSearch={true}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer
      .create(
        <Menu
          refine={() => null}
          createURL={() => '#'}
          searchForItems={() => null}
          searchable
          items={[
            { label: 'white', value: 'white', count: 10, isRefined: false },
            { label: 'black', value: 'black', count: 20, isRefined: false },
            { label: 'blue', value: 'blue', count: 30, isRefined: false },
            { label: 'green', value: 'green', count: 30, isRefined: false },
            { label: 'red', value: 'red', count: 30, isRefined: false },
          ]}
          limit={2}
          showMoreLimit={4}
          showMore={true}
          translations={{
            showMore: ' display more',
            placeholder: 'placeholder',
          }}
          isFromSearch={false}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Menu
        refine={refine}
        searchForItems={() => null}
        createURL={() => '#'}
        items={[
          { label: 'white', value: 'white', count: 10, isRefined: false },
          { label: 'black', value: 'black', count: 20, isRefined: false },
          { label: 'blue', value: 'blue', count: 30, isRefined: false },
        ]}
        isFromSearch={false}
        canRefine={true}
      />
    );

    const items = wrapper.find('li');

    expect(items).toHaveLength(3);

    const firstItem = items.first().find(Link);

    firstItem.simulate('click');

    expect(refine.mock.calls).toHaveLength(1);
    expect(refine.mock.calls[0][0]).toEqual('white');

    wrapper.unmount();
  });

  it('should respect defined limits', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Menu
        refine={refine}
        createURL={() => '#'}
        items={[
          { label: 'white', value: 'white', count: 10, isRefined: false },
          { label: 'black', value: 'black', count: 20, isRefined: false },
          { label: 'blue', value: 'blue', count: 30, isRefined: false },
          { label: 'green', value: 'green', count: 30, isRefined: false },
          { label: 'red', value: 'red', count: 30, isRefined: false },
        ]}
        limit={2}
        showMoreLimit={4}
        showMore={true}
        isFromSearch={false}
        searchForItems={() => null}
        canRefine={true}
      />
    );

    const items = wrapper.find('li');

    expect(items).toHaveLength(2);

    wrapper.find('button').simulate('click');

    expect(wrapper.find('li')).toHaveLength(4);

    wrapper.unmount();
  });

  it('should disabled show more when no more item to display', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Menu
        refine={refine}
        createURL={() => '#'}
        items={[
          { label: 'white', value: 'white', count: 10, isRefined: false },
          { label: 'black', value: 'black', count: 20, isRefined: false },
        ]}
        limit={2}
        showMoreLimit={4}
        showMore={true}
        isFromSearch={false}
        searchForItems={() => null}
        canRefine={true}
      />
    );

    const items = wrapper.find('li');

    expect(items).toHaveLength(2);

    expect(wrapper.find('button[disabled]')).toBeDefined();

    wrapper.unmount();
  });

  describe('search for facets value', () => {
    const refine = jest.fn();
    const searchForItems = jest.fn();
    const menu = (
      <Menu
        refine={refine}
        searchable
        searchForItems={searchForItems}
        createURL={() => '#'}
        items={[
          {
            label: 'white',
            value: 'white',
            count: 10,
            isRefined: false,
            _highlightResult: { label: { value: 'white' } },
          },
          {
            label: 'black',
            value: 'black',
            count: 20,
            isRefined: false,
            _highlightResult: { label: { value: 'black' } },
          },
        ]}
        isFromSearch={true}
        canRefine={true}
      />
    );

    it('a searchbox should be displayed if the feature is activated', () => {
      const wrapper = mount(menu);

      const searchBox = wrapper.find('.searchBox');

      expect(searchBox).toBeDefined();

      wrapper.unmount();
    });

    it('searching for a value should call searchForItems', () => {
      const wrapper = mount(menu);

      wrapper.find('input').simulate('change', { target: { value: 'query' } });

      expect(searchForItems.mock.calls).toHaveLength(1);
      expect(searchForItems.mock.calls[0][0]).toBe('query');

      wrapper.unmount();
    });

    it('should refine the selected value and display selected refinement back', () => {
      const wrapper = mount(menu);

      const firstItem = wrapper.find('li').first().find(Link);
      firstItem.simulate('click');

      expect(refine.mock.calls).toHaveLength(1);
      expect(refine.mock.calls[0][0]).toEqual('white');
      expect(wrapper.find('input').props().value).toBe('');

      const selectedRefinements = wrapper.find('li');
      expect(selectedRefinements).toHaveLength(2);

      wrapper.unmount();
    });

    it('hit enter on the search values results list should refine the first facet value', () => {
      refine.mockClear();
      const wrapper = mount(menu);

      wrapper.find('form').simulate('submit');

      expect(refine.mock.calls).toHaveLength(1);
      expect(refine.mock.calls[0][0]).toEqual('white');
      expect(wrapper.find('input').props().value).toBe('');

      const selectedRefinements = wrapper.find('li');
      expect(selectedRefinements).toHaveLength(2);

      wrapper.unmount();
    });
  });
});
