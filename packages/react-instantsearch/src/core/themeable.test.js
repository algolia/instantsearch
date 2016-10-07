/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import React from 'react';
import {shallow} from 'enzyme';
import reactThemeable from 'react-themeable';
jest.mock('react-themeable');

import themeable from './themeable';

describe('themeable', () => {
  afterEach(() => {
    reactThemeable.mockClear();
  });

  it('provides an applyTheme prop to the composed component', () => {
    const th = () => null;
    reactThemeable.mockImplementationOnce(() => th);
    const Dummy = () => null;
    const defaultTheme = {classNames: {}};
    const Themed = themeable(defaultTheme)(Dummy);
    expect(shallow(<Themed />).find(Dummy).props().applyTheme).toBe(th);
    expect(reactThemeable.mock.calls[0][0]).toBe(defaultTheme.classNames);
  });

  it('uses the theme passed as props instead of the default one', () => {
    const th = () => null;
    reactThemeable.mockImplementationOnce(() => th);
    const Dummy = () => null;
    const defaultTheme = {classNames: 'hello'};
    const theme = {test: 'why'};
    const Themed = themeable(defaultTheme)(Dummy);
    expect(shallow(<Themed theme={theme} />).find(Dummy).props().applyTheme).toBe(th);
    expect(reactThemeable.mock.calls[0][0]).toBe(theme);
  });
});
