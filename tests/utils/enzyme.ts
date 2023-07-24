import { mount, shallow } from 'enzyme';

import type { ShallowWrapper, ReactWrapper } from 'enzyme';
import type { VNode } from 'preact';

/**
 * @deprecated please use testing-library in new tests
 */
const preactMount = mount as unknown as <TProps>(
  node: VNode<TProps>
) => ReactWrapper<TProps, any>;

/**
 * @deprecated please use testing-library in new tests
 */
const preactShallow = shallow as unknown as <TProps>(
  node: VNode<TProps>
) => ShallowWrapper<TProps, any>;

export { preactMount as mount, preactShallow as shallow };
