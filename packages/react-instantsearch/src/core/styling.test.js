/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import styling from './styling';
jest.mock('insert-css');

describe('styling', () => {
  it('should extend theme by adding new className to the default one', () => {
    const Component = {};
    Component.defaultClassNames = {
      keyA: 'className_1',
      keyB: 'className_2',
    };

    const extendedTheme = styling(Component.defaultClassNames, {
      keyB: {
        backgroundColor: '#000000',
      },
    });

    const insertCss = require('insert-css');
    expect(insertCss.mock.calls.length).toBe(1);
    expect(insertCss.mock.calls[0][0]).toContain('.className_2--ext {');
    expect(insertCss.mock.calls[0][0]).toContain('background-color:#000000;');
    expect(insertCss.mock.calls[0][0]).toContain('}');

    expect(extendedTheme).toEqual({
      keyA: 'className_1',
      keyB: 'className_2 className_2--ext',
    });
  });

  it('should throw an error if the provided extended theme contains unknown theme keys', () => {
    const Component = {};
    Component.defaultClassNames = {
      keyA: 'className_1',
      keyB: 'className_2',
    };
    const extendTheme = () => styling(Component.defaultClassNames, {keyC: {backgroundColor: '#000000'}});

    expect(extendTheme)
      .toThrowError('the keyC themeKey doesn\'t not existing in the default theme. Its style can\'t be applied');
  });
});
