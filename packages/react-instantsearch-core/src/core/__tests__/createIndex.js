import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Index from '../../components/Index';
import createIndex from '../createIndex';

Enzyme.configure({ adapter: new Adapter() });

describe('createIndex', () => {
  const CustomIndex = createIndex({ Root: 'div' });

  const requiredProps = {
    indexName: 'indexName',
  };

  it('expects to create an Index', () => {
    const props = {
      ...requiredProps,
    };

    const wrapper = shallow(<CustomIndex {...props} />);

    expect(wrapper.is(Index)).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('expects to create an Index with the default root', () => {
    const props = {
      ...requiredProps,
    };

    const wrapper = shallow(<CustomIndex {...props} />);

    expect(wrapper.props().root).toEqual({
      Root: 'div',
    });
  });

  it('expects to create an Index with a custom root props', () => {
    const props = {
      ...requiredProps,
      root: {
        Root: 'span',
        props: {
          style: {
            flex: 1,
          },
        },
      },
    };

    const wrapper = shallow(<CustomIndex {...props} />);

    expect(wrapper.props().root).toEqual({
      Root: 'span',
      props: {
        style: {
          flex: 1,
        },
      },
    });
  });

  it('expects to create an Index with an indexId when provided', () => {
    const props = {
      ...requiredProps,
      indexId: 'indexId',
    };

    const wrapper = shallow(<CustomIndex {...props} />);

    expect(wrapper.props().indexId).toBe('indexId');
  });

  it("expects to create an Index with an indexId that fallback to indexName when it's not provided", () => {
    const props = {
      ...requiredProps,
    };

    const wrapper = shallow(<CustomIndex {...props} />);

    expect(wrapper.props().indexId).toBe('indexName');
  });
});
