import { mount, shallow, ShallowWrapper, ReactWrapper } from 'enzyme';
import { VNode } from 'preact';

const preactMount = mount as unknown as <TProps>(
  node: VNode<TProps>
) => ReactWrapper<TProps, any>;

const preactShallow = shallow as unknown as <TProps>(
  node: VNode<TProps>
) => ShallowWrapper<TProps, any>;

export { preactMount as mount, preactShallow as shallow };
