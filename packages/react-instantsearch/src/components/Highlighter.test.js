import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Highlighter, { Highlight } from './Highlighter';
import parseAlgoliaHit from '../core/highlight';

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

    const wrapper = shallow(<Highlight {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a nonhighlight', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<Highlight {...props} />);

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

  const highlight = ({ hit, attributeName, highlightProperty }) =>
    parseAlgoliaHit({
      preTag: '<ais-highlight>',
      postTag: '</ais-highlight>',
      attributeName,
      hit,
      highlightProperty,
    });

  const defaultProps = {
    hit: hitFromAPI,
    attributeName: 'title',
    highlightProperty: '_highlight',
    highlight,
  };

  it('renders a highlighted value', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<Highlighter {...props} />);

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
    };

    const wrapper = shallow(<Highlighter {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom tagName', () => {
    const props = {
      ...defaultProps,
      tagName: 'strong',
    };

    const wrapper = shallow(<Highlighter {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom nonHighlightedTagName', () => {
    const props = {
      ...defaultProps,
      nonHighlightedTagName: 'p',
    };

    const wrapper = shallow(<Highlighter {...props} />);

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

  const highlight = ({ hit, attributeName, highlightProperty }) =>
    parseAlgoliaHit({
      preTag: '<ais-highlight>',
      postTag: '</ais-highlight>',
      attributeName,
      hit,
      highlightProperty,
    });

  const defaultProps = {
    hit: hitFromAPI,
    attributeName: 'titles',
    highlightProperty: '_highlight',
    highlight,
  };

  it('renders a highlighted value', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<Highlighter {...props} />);

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
    };

    const wrapper = shallow(<Highlighter {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom tagName', () => {
    const props = {
      ...defaultProps,
      tagName: 'strong',
    };

    const wrapper = shallow(<Highlighter {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom nonHighlightedTagName', () => {
    const props = {
      ...defaultProps,
      nonHighlightedTagName: 'p',
    };

    const wrapper = shallow(<Highlighter {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders a highlighted value with a custom separator', () => {
    const props = {
      ...defaultProps,
      separator: '-',
    };

    const wrapper = shallow(<Highlighter {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
