import React from 'react';
import { mount } from 'enzyme';

import PoweredBy from '../PoweredBy';
import { Theme } from '../../../widgets/powered-by/powered-by';

const cssClasses = {
  root: 'root',
  link: 'link',
  logo: 'logo',
};

describe('PoweredBy', () => {
  it('default', () => {
    const tree = mount(
      <PoweredBy cssClasses={cssClasses} theme={Theme.Light} url="url" />
    );

    expect(tree).toMatchSnapshot();
  });

  it('with dark theme', () => {
    const tree = mount(
      <PoweredBy cssClasses={cssClasses} theme={Theme.Dark} url="url" />
    );

    expect(tree).toMatchSnapshot();
  });
});
