/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import RefinementList from './RefinementList';

jest.mock('../widgets/Highlight');

describe('RefinementList', () => {
  it('default refinement list', () => {
    const tree = renderer.create(
      <RefinementList
        refine={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: true},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
          {label: 'blue', value: ['blue'], count: 30, isRefined: false},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        isFromSearch={false}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refinement list with search for facet values', () => {
    const tree = renderer.create(
      <RefinementList
        refine={() => null}
        searchForFacetValues={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: true},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
          {label: 'blue', value: ['blue'], count: 30, isRefined: false},
        ]}
        isFromSearch={false}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer.create(
      <RefinementList
        refine={() => null}
        searchForFacetValues={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: false},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
          {label: 'blue', value: ['blue'], count: 30, isRefined: false},
        ]}
        isFromSearch={true}
        translations={{
          showMore: ' display more',
          noResults: ' no results',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RefinementList
        refine={refine}
        searchForFacetValues={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: false},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
          {label: 'blue', value: ['blue'], count: 30, isRefined: false},
        ]}
        isFromSearch={false}
      />
    );

    const items = wrapper.find('.ais-RefinementList__item');

    expect(items.length).toBe(3);

    const firstItem = items.first().find('.ais-RefinementList__itemCheckbox');

    firstItem.simulate('change', {target: {checked: true}});

    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual(['white']);

    wrapper.unmount();
  });

  it('should respect defined limits', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RefinementList
        refine={refine}
        searchForFacetValues={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: false},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
          {label: 'blue', value: ['blue'], count: 30, isRefined: false},
          {label: 'red', value: ['red'], count: 30, isRefined: false},
          {label: 'green', value: ['green'], count: 30, isRefined: false},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        isFromSearch={false}
      />
    );

    const items = wrapper.find('.ais-RefinementList__item');

    expect(items.length).toBe(2);

    wrapper.find('.ais-RefinementList__showMore').simulate('click');

    expect(wrapper.find('.ais-RefinementList__item').length).toBe(4);

    wrapper.unmount();
  });

  it('should disabled show more when no more item to display', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <RefinementList
        refine={refine}
        searchForFacetValues={() => null}
        createURL={() => '#'}
        items={[
          {label: 'white', value: ['white'], count: 10, isRefined: false},
          {label: 'black', value: ['black'], count: 20, isRefined: false},
        ]}
        limitMin={2}
        limitMax={4}
        showMore={true}
        isFromSearch={false}
      />
    );

    const items = wrapper.find('.ais-RefinementList__item');

    expect(items.length).toBe(2);

    expect(wrapper.find('.ais-RefinementList__showMoreDisabled')).toBeDefined();

    wrapper.unmount();
  });

  describe('search for facets value', () => {
    const refine = jest.fn();
    const searchForFacetValues = jest.fn();
    const refinementList = <RefinementList
      refine={refine}
      searchForFacetValues={searchForFacetValues}
      createURL={() => '#'}
      items={[
        {
          label: 'white', value: ['white'], count: 10, isRefined: false, _highlightResult: {label: {value: 'white'}},
        },
        {
          label: 'black', value: ['black'], count: 20, isRefined: false, _highlightResult: {label: {value: 'black'}},
        },
      ]}
      isFromSearch={true}
    />;

    it('a searchbox should be displayed if the feature is activated', () => {
      const wrapper = mount(refinementList);

      const searchBox = wrapper.find('.ais-RefinementList__SearchBox');

      expect(searchBox).toBeDefined();

      wrapper.unmount();
    });

    it('searching for a value should call searchForFacetValues', () => {
      const wrapper = mount(refinementList);

      wrapper.find('.ais-RefinementList__SearchBox input').simulate('change', {target: {value: 'query'}});

      expect(searchForFacetValues.mock.calls.length).toBe(1);
      expect(searchForFacetValues.mock.calls[0][0]).toBe('query');

      wrapper.unmount();
    });

    it('should refine the selected value and display selected refinement back', () => {
      const wrapper = mount(refinementList);

      const firstItem = wrapper.find('.ais-RefinementList__item').first().find('.ais-RefinementList__itemCheckbox');
      firstItem.simulate('change', {target: {checked: true}});

      expect(refine.mock.calls.length).toBe(1);
      expect(refine.mock.calls[0][0]).toEqual(['white']);
      expect(wrapper.find('.ais-RefinementList__SearchBox input').props().value).toBe('');

      const selectedRefinements = wrapper.find('.ais-RefinementList__item');
      expect(selectedRefinements.length).toBe(2);

      wrapper.unmount();
    });

    it('hit enter on the search values results list should refine the first facet value', () => {
      refine.mockClear();
      const wrapper = mount(refinementList);

      wrapper.find('form').simulate('submit');

      expect(refine.mock.calls.length).toBe(1);
      expect(refine.mock.calls[0][0]).toEqual(['white']);
      expect(wrapper.find('.ais-RefinementList__SearchBox input').props().value).toBe('');

      const selectedRefinements = wrapper.find('.ais-RefinementList__item');
      expect(selectedRefinements.length).toBe(2);

      wrapper.unmount();
    });
  });
});
