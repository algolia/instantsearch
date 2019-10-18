import React from 'react';
import renderer from 'react-test-renderer';
import App from '../pages/index';

describe('Next app recipes', () => {
  it('App renders without crashing', () => {
    const component = renderer.create(<App searchState={{}} router={{}} />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
