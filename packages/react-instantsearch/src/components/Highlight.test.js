import React from 'react';
import renderer from 'react-test-renderer';
import Highlight from './Highlight';
import parseAlgoliaHit from '../core/highlight';

describe('Highlight', () => {
  it('parses an highlighted attribute of hit object', () => {
    const hitFromAPI = {
      objectID: 0,
      deep: { attribute: { value: 'awesome highlighted hit!' } },
      _highlightResult: {
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

    const highlight = ({ hit, attributeName, highlightProperty }) =>
      parseAlgoliaHit({
        preTag: '<ais-highlight>',
        postTag: '</ais-highlight>',
        attributeName,
        hit,
        highlightProperty,
      });

    const tree = renderer.create(
      <Highlight
        attributeName="deep.attribute.value"
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
      _highlightResult: {
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

    const highlight = ({ hit, attributeName, highlightProperty }) =>
      parseAlgoliaHit({
        preTag: '<ais-highlight>',
        postTag: '</ais-highlight>',
        attributeName,
        hit,
        highlightProperty,
      });

    const tree = renderer.create(
      <Highlight
        attributeName="deep.attribute.value"
        hit={hitFromAPI}
        highlight={highlight}
        tagName="marquee"
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
