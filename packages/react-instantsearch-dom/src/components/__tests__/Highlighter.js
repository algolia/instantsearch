import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import Highlighter, { Highlight } from '../Highlighter';

Enzyme.configure({ adapter: new Adapter() });

describe('Highlighter - Highlight', () => {
  const defaultProps = {
    value: 'test',
    highlightedTagName: 'em',
    isHighlighted: false,
    nonHighlightedTagName: 'div',
  };

  it('renders a highlight', () => {
    const props = {
      ...defaultProps,
      isHighlighted: true,
    };

    const wrapper = shallow(
      <Highlight cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a nonhighlight', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(
      <Highlight cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});

describe('Highlighter - simple', () => {
  const hitFromAPI = {
    objectID: 3,
    title: 'Apple',
    _highlight: {
      title: {
        value: '<ais-highlight>Ap</ais-highlight>ple',
      },
    },
  };

  const defaultProps = {
    hit: hitFromAPI,
    attribute: 'title',
    highlightProperty: '_highlight',
  };

  it('renders a highlighted value', () => {
    const props = {
      ...defaultProps,
      highlight: () => [
        { value: 'Ap', isHighlighted: true },
        { value: 'ple', isHighlighted: false },
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a non highlighted value', () => {
    const props = {
      ...defaultProps,
      hit: {
        objectID: 3,
        title: 'Apple',
        _highlight: {
          title: {
            value: 'Apple',
          },
        },
      },
      highlight: () => [{ value: 'Apple', isHighlighted: false }],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom tagName', () => {
    const props = {
      ...defaultProps,
      tagName: 'strong',
      highlight: () => [
        { value: 'Ap', isHighlighted: true },
        { value: 'ple', isHighlighted: false },
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom nonHighlightedTagName', () => {
    const props = {
      ...defaultProps,
      nonHighlightedTagName: 'p',
      highlight: () => [
        { value: 'Ap', isHighlighted: true },
        { value: 'ple', isHighlighted: false },
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders with a custom className', () => {
    const props = {
      ...defaultProps,
      className: 'MyCustomHighlighter',
      highlight: () => [
        { value: 'Ap', isHighlighted: true },
        { value: 'ple', isHighlighted: false },
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});

describe('Highlighter - multi', () => {
  const hitFromAPI = {
    objectID: 3,
    titles: ['Apple', 'Samsung', 'Philips'],
    _highlight: {
      titles: [
        {
          value: 'Apple',
        },
        {
          value: '<ais-highlight>Sam</ais-highlight>sung',
        },
        {
          value: 'Philips',
        },
      ],
    },
  };

  const defaultProps = {
    hit: hitFromAPI,
    attribute: 'titles',
    highlightProperty: '_highlight',
  };

  it('renders a highlighted value', () => {
    const props = {
      ...defaultProps,
      highlight: () => [
        [{ value: 'Apple', isHighlighted: false }],
        [
          { value: 'Sam', isHighlighted: true },
          { value: 'sung', isHighlighted: false },
        ],
        [{ value: 'Philips', isHighlighted: false }],
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a non highlighted value', () => {
    const props = {
      ...defaultProps,
      hit: {
        objectID: 3,
        titles: ['Apple', 'Samsung', 'Philips'],
        _highlight: {
          titles: [
            {
              value: 'Apple',
            },
            {
              value: 'Samsung',
            },
            {
              value: 'Philips',
            },
          ],
        },
      },
      highlight: () => [
        [{ value: 'Apple', isHighlighted: false }],
        [{ value: 'Samsung', isHighlighted: false }],
        [{ value: 'Philips', isHighlighted: false }],
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom tagName', () => {
    const props = {
      ...defaultProps,
      tagName: 'strong',
      highlight: () => [
        [{ value: 'Apple', isHighlighted: false }],
        [
          { value: 'Sam', isHighlighted: true },
          { value: 'sung', isHighlighted: false },
        ],
        [{ value: 'Philips', isHighlighted: false }],
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom nonHighlightedTagName', () => {
    const props = {
      ...defaultProps,
      nonHighlightedTagName: 'p',
      highlight: () => [
        [{ value: 'Apple', isHighlighted: false }],
        [
          { value: 'Sam', isHighlighted: true },
          { value: 'sung', isHighlighted: false },
        ],
        [{ value: 'Philips', isHighlighted: false }],
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom separator', () => {
    const props = {
      ...defaultProps,
      separator: '-',
      highlight: () => [
        [{ value: 'Apple', isHighlighted: false }],
        [
          { value: 'Sam', isHighlighted: true },
          { value: 'sung', isHighlighted: false },
        ],
        [{ value: 'Philips', isHighlighted: false }],
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a custom className', () => {
    const props = {
      ...defaultProps,
      className: 'MyCustomHighlighter',
      highlight: () => [
        [{ value: 'Apple', isHighlighted: false }],
        [
          { value: 'Sam', isHighlighted: true },
          { value: 'sung', isHighlighted: false },
        ],
        [{ value: 'Philips', isHighlighted: false }],
      ],
    };

    const wrapper = shallow(
      <Highlighter cx={(...x) => x.join(' ')} {...props} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
