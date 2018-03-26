import React from 'react';
import App from './App';
import { Router, Route, browserHistory } from 'react-router';
import renderer from 'react-test-renderer';

describe('react-router recipe', () => {
  it('App renders without crashing', () => {
    const RoutedApp = (
      <Router history={browserHistory}>
        <Route path="blank" component={App} />
      </Router>
    );

    const component = renderer.create(RoutedApp);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
