/**
 * @jest-environment jsdom
 */

import React from 'react';
import renderer from 'react-test-renderer';

import Mentions from '../App-Mentions';
import MultiIndex from '../App-Multi-Index';

jest.mock('antd/lib/mention', () => {
  return ({ placeholder, suggestions }) =>
    `<Mention>
  ${placeholder}
  ${suggestions.join('\n')}
</Mention>`;
});

describe('autocomplete recipe', () => {
  it('MultiIndex renders without crashing', () => {
    const component = renderer.create(<MultiIndex />);

    expect(component.toJSON()).toMatchSnapshot();
  });
  it('Mentions renders without crashing', () => {
    const component = renderer.create(<Mentions />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
