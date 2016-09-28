/* eslint-env jest, jasmine */
import React from 'react';

import highlight from './highlight.js';

describe('highlight()', () => {
  it('creates a single element when there is no tag', () => {
    const value = 'foo bar baz';
    const attribute = 'attr';
    const out = highlight(attribute, createHit(attribute, value));
    expect(out).toEqual([value]);
  });

  it('creates a single element when there is only a tag', () => {
    const textValue = 'foo bar baz';
    const value = `<em>${textValue}</em>`;
    const attribute = 'attr';
    const out = highlight(attribute, createHit(attribute, value));
    expect(out).toEqual([<em className="ais-highlightedValue" key="split-0-foo bar baz">{textValue}</em>]);
  });

  it('creates two elements when there is a tag and some text', () => {
    const textValue = 'foo bar baz';
    const otherText = 'other text';
    const value = `<em>${textValue}</em>${otherText}`;
    const attribute = 'attr';
    const out = highlight(attribute, createHit(attribute, value));
    expect(out).toEqual(
      [
        <em className="ais-highlightedValue" key="split-0-foo bar baz">{textValue}</em>,
        otherText,
      ]
    );
  });

  it('creates two elements when there is some text and a tag', () => {
    const textValue = 'foo bar baz';
    const otherText = 'other text';
    const value = `${otherText}<em>${textValue}</em>`;
    const attribute = 'attr';
    const out = highlight(attribute, createHit(attribute, value));
    expect(out).toEqual(
      [
        otherText,
        <em className="ais-highlightedValue" key="split-0-foo bar baz">{textValue}</em>,
      ]
    );
  });

  it('creates four elements when there is some text, a tag, another tag, and some text', () => {
    const textValue = 'foo bar baz';
    const otherText = 'other text';
    const value = `${otherText}<em>${textValue}</em><em>${textValue}</em>${otherText}`;
    const attribute = 'attr';
    const out = highlight(attribute, createHit(attribute, value));
    expect(out).toEqual(
      [
        otherText,
        <em className="ais-highlightedValue" key="split-0-foo bar baz">{textValue}</em>,
        <em className="ais-highlightedValue" key="split-1-foo bar baz">{textValue}</em>,
        otherText,
      ]
    );
  });

  it('creates three elements when there is a tag, some text and another tag', () => {
    const textValue = 'foo bar baz';
    const otherText = 'other text';
    const value = `<em>${textValue}</em>${otherText}<em>${textValue}</em>`;
    const attribute = 'attr';
    const out = highlight(attribute, createHit(attribute, value));
    expect(out).toEqual(
      [
        <em className="ais-highlightedValue" key="split-0-foo bar baz">{textValue}</em>,
        otherText,
        <em className="ais-highlightedValue" key="split-1-foo bar baz">{textValue}</em>,
      ]
    );
  });

  it('throws when the attribute is not returned in the hit', () => {
    expect(highlight.bind(null, 'unknownAttribute', {}))
      .toThrowError('unknownAttribute should be a retrievable attribute');
  });

  it('throws when the attribute is not highlighted in the hit', () => {
    expect(highlight.bind(null, 'notHighlightedAttribute', {notHighlightedAttribute: ''}))
      .toThrowError('notHighlightedAttribute should be an highlighted attribute');
  });

  it('throws when hit is `null`', () => {
    expect(highlight.bind(null, 'unknownAttribute', null))
      .toThrowError('The hit containing the attribute should be provided');
  });

  it('throws when hit is `undefined`', () => {
    expect(highlight.bind(null, 'unknownAttribute', undefined))
      .toThrowError('The hit containing the attribute should be provided');
  });
});

function createHit(attribute, value) {
  return {
    [attribute]: value,
    _highlightResult: {
      [attribute]: {
        value,
        fullyHighlighted: true,
        matchLevel: 'full',
        matchedWords: [''],
      },
    },
  };
}
