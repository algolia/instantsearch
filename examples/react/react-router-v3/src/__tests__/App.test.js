/**
 * @jest-environment jsdom
 */

import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import renderer from 'react-test-renderer';

import App from '../App';

describe('react-router recipe', () => {
  it('App renders without crashing', () => {
    const RoutedApp = (
      <Router history={browserHistory}>
        <Route path="/" component={App} />
      </Router>
    );

    const component = renderer.create(RoutedApp);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
