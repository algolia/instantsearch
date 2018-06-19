import React from 'react';
import renderer from 'react-test-renderer';
import App from './App';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory('/');
const { location } = history;

describe('react-router recipe', () => {
  it('App renders without crashing', () => {
    const component = renderer.create(<App location={location} />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
