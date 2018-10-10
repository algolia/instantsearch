import React from 'react';
import { mount } from 'enzyme';

import PoweredBy from '../PoweredBy';

const cssClasses = {
  root: 'root',
  link: 'link',
  logo: 'logo',
};

describe('PoweredBy', () => {
  it('default', () => {
    const tree = mount(
      <PoweredBy cssClasses={cssClasses} theme="light" url="url" />
    );

    expect(tree).toMatchSnapshot();
  });

  it('with dark theme', () => {
    const tree = mount(
      <PoweredBy cssClasses={cssClasses} theme="dark" url="url" />
    );

    expect(tree).toMatchSnapshot();
  });
});
