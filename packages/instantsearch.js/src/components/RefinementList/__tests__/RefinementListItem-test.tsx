/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { shallow } from '@instantsearch/testutils/enzyme';
import { h } from 'preact';

import RefinementListItem from '../RefinementListItem';

import type { RefinementListItemProps } from '../RefinementListItem';

describe('RefinementListItem', () => {
  const props: RefinementListItemProps = {
    facetValueToRefine: 'wi',
    isRefined: false,
    handleClick: jest.fn(),
    className: 'item class',
    templateData: { template: 'data' },
    templateKey: 'item key',
    templateProps: { template: 'props' },
    subItems: <div />,
  };

  it('renders an item', () => {
    const wrapper = shallow(<RefinementListItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the right function', () => {
    const out = render(props);
    out.simulate('click');
    expect(props.handleClick).toHaveBeenCalledTimes(1);
  });

  function render(askedProps: RefinementListItemProps) {
    return shallow(<RefinementListItem {...askedProps} />);
  }
});
