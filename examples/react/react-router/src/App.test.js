import React from 'react';
import renderer from 'react-test-renderer';
import App from './App';

describe('react-router recipe', () => {
  it('App renders without crashing', () => {
    const component = renderer.create(
      <App location={{ search: { slice: jest.fn() } }} />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
