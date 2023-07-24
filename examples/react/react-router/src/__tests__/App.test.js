/**
 * @jest-environment jsdom
 */

import { createMemoryHistory } from 'history';
import React from 'react';
import { Router, Route } from 'react-router-dom/cjs/react-router-dom.min';
import renderer from 'react-test-renderer';

import App from '../App';

const history = createMemoryHistory('/');

describe('react-router recipe', () => {
  it('App renders without crashing', () => {
    const component = renderer.create(
      <Router history={history}>
        <Route path="/" component={App} />
      </Router>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
