/**
 * @jest-environment jsdom
 */

import React from 'react';
import renderer from 'react-test-renderer';

import App from '../App';

describe('geo-search recipe', () => {
  it('App renders without crashing', () => {
    const component = renderer.create(<App />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
