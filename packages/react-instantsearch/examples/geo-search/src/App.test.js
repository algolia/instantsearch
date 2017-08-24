import React from 'react';
import App from './App';
import renderer from 'react-test-renderer';

jest.mock('google-map-react');

describe('geo-search recipe', () => {
  it('App renders without crashing', () => {
    const component = renderer.create(<App />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
