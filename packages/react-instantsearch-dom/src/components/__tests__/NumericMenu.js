/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';

import NumericMenu from '../NumericMenu';

Enzyme.configure({ adapter: new Adapter() });

describe('NumericMenu', () => {
  it('supports passing items values', () => {
    const tree = renderer
      .create(
        <NumericMenu
          createURL={() => '#'}
          refine={() => null}
          items={[
            {
              label: 'label1',
              value: '10:',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label2',
              value: '10:20',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label3',
              value: '20:30',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label4',
              value: '30:',
              isRefined: false,
              noRefinement: false,
            },
            { label: 'All', value: '', isRefined: true, noRefinement: false },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('supports passing custom className', () => {
    const tree = renderer
      .create(
        <NumericMenu
          className="MyCustomNumericMenu"
          createURL={() => '#'}
          refine={() => null}
          items={[
            {
              label: 'label1',
              value: '10:',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label2',
              value: '10:20',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label3',
              value: '20:30',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label4',
              value: '30:',
              isRefined: false,
              noRefinement: false,
            },
            { label: 'All', value: '', isRefined: true, noRefinement: false },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('supports having a selected item', () => {
    const tree = renderer
      .create(
        <NumericMenu
          createURL={() => '#'}
          refine={() => null}
          items={[
            {
              label: 'label1',
              value: '10:',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label2',
              value: '10:20',
              isRefined: true,
              noRefinement: false,
            },
            {
              label: 'label3',
              value: '20:30',
              isRefined: false,
              noRefinement: false,
            },
            {
              label: 'label4',
              value: '30:',
              isRefined: false,
              noRefinement: false,
            },
            { label: 'All', value: '', isRefined: false, noRefinement: false },
          ]}
          canRefine={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('no refinements', () => {
    const tree = renderer
      .create(
        <NumericMenu
          createURL={() => '#'}
          refine={() => null}
          items={[
            {
              label: 'label1',
              value: '10:',
              isRefined: false,
              noRefinement: true,
            },
            {
              label: 'label2',
              value: '10:20',
              isRefined: false,
              noRefinement: true,
            },
            {
              label: 'label3',
              value: '20:30',
              isRefined: false,
              noRefinement: true,
            },
            {
              label: 'label4',
              value: '30:',
              isRefined: false,
              noRefinement: true,
            },
            { label: 'All', value: '', isRefined: true, noRefinement: false },
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
      <NumericMenu
        refine={refine}
        items={[
          {
            label: 'label',
            value: '10:',
            isRefined: false,
            noRefinement: false,
          },
          {
            label: 'label',
            value: '10:20',
            isRefined: false,
            noRefinement: false,
          },
          {
            label: 'label',
            value: '20:30',
            isRefined: false,
            noRefinement: false,
          },
          {
            label: 'label',
            value: '30:',
            isRefined: false,
            noRefinement: false,
          },
        ]}
        canRefine={true}
      />
    );

    const items = wrapper.find('li');

    expect(items).toHaveLength(4);

    const firstItem = items.first().find('input');

    firstItem.simulate('change', { target: { checked: true } });

    expect(refine.mock.calls).toHaveLength(1);
    expect(refine.mock.calls[0][0]).toEqual('10:');

    wrapper.unmount();
  });

  it('indicate when there is no refinement', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <NumericMenu
        refine={refine}
        items={[
          {
            label: 'label',
            value: '10:',
            isRefined: false,
            noRefinement: true,
          },
          {
            label: 'label',
            value: '10:20',
            isRefined: false,
            noRefinement: true,
          },
          {
            label: 'label',
            value: '20:30',
            isRefined: false,
            noRefinement: true,
          },
          {
            label: 'label',
            value: '30:',
            isRefined: false,
            noRefinement: true,
          },
        ]}
        canRefine={false}
      />
    );

    const itemWrapper = wrapper.find('.ais-NumericMenu-list--noRefinement');
    expect(itemWrapper).toHaveLength(1);

    const items = wrapper.find('.ais-NumericMenu-item--noRefinement');
    expect(items).toHaveLength(4);

    wrapper.unmount();
  });
});
