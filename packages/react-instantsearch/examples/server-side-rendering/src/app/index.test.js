import React from 'react';
import renderer from 'react-test-renderer';
import { App } from './index.js';

describe('Server-side rendering recipes', () => {
  it('App renders without crashing', () => {
    const component = renderer.create(<App />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
