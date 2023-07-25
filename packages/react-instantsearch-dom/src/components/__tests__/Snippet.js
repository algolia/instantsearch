import React from 'react';
import renderer from 'react-test-renderer';

import Snippet from '../Snippet';

describe('Snippet', () => {
  it('parses an highlighted snippet attribute of hit object', () => {
    const hitFromAPI = {
      objectID: 0,
      deep: { attribute: { value: 'awesome highlighted hit!' } },
      _snippetResult: {
        deep: {
          attribute: {
            value: {
              value:
                'awesome <ais-highlight>hi</ais-highlight>ghlighted <ais-highlight>hi</ais-highlight>t!',
              fullyHighlighted: true,
              matchLevel: 'full',
              matchedWords: [''],
            },
          },
        },
      },
    };

    const highlight = () => [
      { value: 'awesome ', isHighlighted: false },
      { value: 'hi', isHighlighted: true },
      { value: 'ghlighted ', isHighlighted: false },
      { value: 'hi', isHighlighted: true },
      { value: 't!', isHighlighted: false },
    ];

    const tree = renderer.create(
      <Snippet
        cx={(...x) => x.join(' ')}
        attribute="deep.attribute.value"
        hit={hitFromAPI}
        highlight={highlight}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a hit with a custom tag correctly', () => {
    const hitFromAPI = {
      objectID: 0,
      deep: { attribute: { value: 'awesome highlighted hit!' } },
      _snippetResult: {
        deep: {
          attribute: {
            value: {
              value:
                'awesome <ais-highlight>hi</ais-highlight>ghlighted <ais-highlight>hi</ais-highlight>t!',
              fullyHighlighted: true,
              matchLevel: 'full',
              matchedWords: [''],
            },
          },
        },
      },
    };

    const highlight = () => [
      { value: 'awesome ', isHighlighted: false },
      { value: 'hi', isHighlighted: true },
      { value: 'ghlighted ', isHighlighted: false },
      { value: 'hi', isHighlighted: true },
      { value: 't!', isHighlighted: false },
    ];

    const tree = renderer.create(
      <Snippet
        cx={(...x) => x.join(' ')}
        attribute="deep.attribute.value"
        hit={hitFromAPI}
        highlight={highlight}
        tagName="strong"
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a hit with a custom className', () => {
    const hitFromAPI = {
      objectID: 0,
      deep: { attribute: { value: 'awesome highlighted hit!' } },
      _snippetResult: {
        deep: {
          attribute: {
            value: {
              value:
                'awesome <ais-highlight>hi</ais-highlight>ghlighted <ais-highlight>hi</ais-highlight>t!',
              fullyHighlighted: true,
              matchLevel: 'full',
              matchedWords: [''],
            },
          },
        },
      },
    };

    const highlight = () => [
      { value: 'awesome ', isHighlighted: false },
      { value: 'hi', isHighlighted: true },
      { value: 'ghlighted ', isHighlighted: false },
      { value: 'hi', isHighlighted: true },
      { value: 't!', isHighlighted: false },
    ];

    const tree = renderer.create(
      <Snippet
        cx={(...x) => x.join(' ')}
        className="MyCustomSnippet"
        attribute="deep.attribute.value"
        hit={hitFromAPI}
        highlight={highlight}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
