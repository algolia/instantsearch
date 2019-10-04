/** @jsx h */

import { h } from 'preact';
import { render } from 'preact-testing-library';

import PoweredBy from '../PoweredBy';

const cssClasses = {
  root: 'root',
  link: 'link',
  logo: 'logo',
};

describe('PoweredBy', () => {
  it('default', () => {
    const { container } = render(
      <PoweredBy cssClasses={cssClasses} theme="light" url="url" />
    );

    expect(container).toMatchSnapshot();
  });

  it('with dark theme', () => {
    const { container } = render(
      <PoweredBy cssClasses={cssClasses} theme="dark" url="url" />
    );

    expect(container).toMatchSnapshot();
  });
});
