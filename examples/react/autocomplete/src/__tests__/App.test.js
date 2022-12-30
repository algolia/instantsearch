/**
 * @jest-environment jsdom
 */

import React from 'react';
import MultiIndex from '../App-Multi-Index';
import Mentions from '../App-Mentions';
import renderer from 'react-test-renderer';

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
