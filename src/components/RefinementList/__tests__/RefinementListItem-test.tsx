/** @jsx h */

import { h } from 'preact';
import { shallow } from '../../../../test/utils/enzyme';
import type { RefinementListItemProps } from '../RefinementListItem';
import RefinementListItem from '../RefinementListItem';

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
