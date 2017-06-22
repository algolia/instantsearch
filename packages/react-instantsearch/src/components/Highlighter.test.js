/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import Highlighter from './Highlighter';
import parseAlgoliaHit from '../core/highlight';

describe('Highlighter', () => {
  it('parses an highlighted attribute of hit object', () => {
    const hitFromAPI = {
      objectID: 0,
      deep: { attribute: { value: 'awesome highlighted hit!' } },
      _highlightProperty: {
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
      <Highlighter
        attributeName="deep.attribute.value"
        hit={hitFromAPI}
        highlight={highlight}
        highlightProperty="_highlightProperty"
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a hit with a custom tag correctly', () => {
    const hitFromAPI = {
      objectID: 0,
      deep: { attribute: { value: 'awesome highlighted hit!' } },
      _highlightProperty: {
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
      <Highlighter
        attributeName="deep.attribute.value"
        hit={hitFromAPI}
        highlight={highlight}
        highlightProperty="_highlightProperty"
        tagName="mark"
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
