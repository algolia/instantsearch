import PropTypes from 'prop-types';
/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import Breadcrumb from './Breadcrumb';

describe('Breadcrumb', () => {
  it('outputs the default breadcrumb', () => {
    const tree = renderer
      .create(
        <Breadcrumb
          refine={() => null}
          createURL={() => '#'}
          items={[
            {
              value: 'white',
              label: 'white',
            },
            {
              value: 'white > white1',
              label: 'white1',
            },
            {
              value: 'white > white1 > white1.1',
              label: 'white1.1',
            },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value on change', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Breadcrumb
        refine={refine}
        createURL={() => '#'}
        items={[
          {
            value: 'white',
            label: 'white',
          },
          {
            value: 'white > white1',
            label: 'white1',
          },
          {
            value: 'white > white1 > white1.1',
            label: 'white1.1',
          },
        ]}
        canRefine={true}
      />
    );

    const items = wrapper.find('.ais-Breadcrumb__itemLink');
    expect(items.length).toBe(4);

    items.first().simulate('click');
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual();

    items.at(1).simulate('click');
    expect(refine.mock.calls.length).toBe(2);
    expect(refine.mock.calls[1][0]).toEqual('white');

    items.at(2).simulate('click');
    expect(refine.mock.calls.length).toBe(3);
    expect(refine.mock.calls[2][0]).toEqual('white > white1');

    items.at(3).simulate('click');
    expect(refine.mock.calls.length).toBe(3);

    wrapper.unmount();
  });

  it('has a rootURL prop', () => {
    const refine = jest.fn();
    const rootLink = 'www.algolia.com';

    const wrapper = mount(
      <Breadcrumb
        refine={refine}
        createURL={() => '#'}
        rootURL={rootLink}
        items={[
          {
            value: 'white',
            label: 'white',
          },
          {
            value: 'white > white1',
            label: 'white1',
          },
          {
            value: 'white > white1 > white1.1',
            label: 'white1.1',
          },
        ]}
        canRefine={true}
      />
    );

    const items = wrapper.find('.ais-Breadcrumb__itemLink');
    expect(items.length).toBe(4);

    items.first().simulate('click');
    expect(refine.mock.calls.length).toBe(0);
    expect(wrapper.find('a').first().prop('href')).toEqual('www.algolia.com');

    wrapper.unmount();
  });

  it('has a separator prop that can be a custom component', () => {
    const tree = renderer
      .create(
        <Breadcrumb
          refine={() => null}
          createURL={() => '#'}
          separator={<span>🔍</span>}
          items={[
            {
              value: 'white',
              label: 'white',
            },
            {
              value: 'white > white1',
              label: 'white1',
            },
            {
              value: 'white > white1 > white1.1',
              label: 'white1.1',
            },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('has customizable translations', () => {
    const tree = renderer
      .create(
        <Breadcrumb
          refine={() => null}
          createURL={() => '#'}
          translations={{
            rootLabel: 'ROOT_LABEL',
          }}
          items={[
            {
              value: 'white',
              label: 'white',
            },
            {
              value: 'white > white1',
              label: 'white1',
            },
            {
              value: 'white > white1 > white1.1',
              label: 'white1.1',
            },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('Panel compatibility', () => {
    it('Should indicate when there is no more refinement', () => {
      const canRefine = jest.fn();
      const wrapper = mount(
        <Breadcrumb
          refine={() => null}
          createURL={() => '#'}
          items={[
            {
              value: 'white',
              label: 'white',
            },
            {
              value: 'white > white1',
              label: 'white1',
            },
          ]}
          canRefine={true}
        />,
        {
          context: { canRefine },
          childContextTypes: { canRefine: PropTypes.func },
        }
      );

      expect(canRefine.mock.calls.length).toBe(1);
      expect(canRefine.mock.calls[0][0]).toEqual(true);
      expect(wrapper.find('.ais-Breadcrumb__noRefinement').length).toBe(0);

      wrapper.setProps({ canRefine: false });

      expect(canRefine.mock.calls.length).toBe(2);
      expect(canRefine.mock.calls[1][0]).toEqual(false);
      expect(wrapper.find('.ais-Breadcrumb__noRefinement').length).toBe(1);
    });
  });
});
