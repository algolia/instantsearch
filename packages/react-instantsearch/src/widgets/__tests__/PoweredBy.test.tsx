/**
 * @jest-environment jsdom
 */

import { InstantSearchTestWrapper } from '@instantsearch/testutils';
import { render } from '@testing-library/react';
import React from 'react';

import { PoweredBy } from '../PoweredBy';

describe('PoweredBy', () => {
  test('customizes the class names with the light theme', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <PoweredBy
          classNames={{
            root: 'MyCustomPoweredBy',
            light: 'MyCustomPoweredByLight',
            link: 'MyCustomPoweredByLink',
            logo: 'MyCustomPoweredByLogo',
          }}
        />
      </InstantSearchTestWrapper>
    );

    expect(container.firstChild).toHaveClass(
      'ais-PoweredBy',
      'ais-PoweredBy--light',
      'MyCustomPoweredBy',
      'MyCustomPoweredByLight'
    );
    expect(container.querySelector('.ais-PoweredBy-link')).toHaveClass(
      'MyCustomPoweredByLink'
    );
    expect(container.querySelector('.ais-PoweredBy-logo')).toHaveClass(
      'MyCustomPoweredByLogo'
    );
  });

  test('customizes the class names with the dark theme', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <PoweredBy
          theme="dark"
          classNames={{
            root: 'MyCustomPoweredBy',
            dark: 'MyCustomPoweredByDark',
            link: 'MyCustomPoweredByLink',
            logo: 'MyCustomPoweredByLogo',
          }}
        />
      </InstantSearchTestWrapper>
    );

    expect(container.firstChild).toHaveClass(
      'ais-PoweredBy',
      'ais-PoweredBy--dark',
      'MyCustomPoweredBy',
      'MyCustomPoweredByDark'
    );
    expect(container.querySelector('.ais-PoweredBy-link')).toHaveClass(
      'MyCustomPoweredByLink'
    );
    expect(container.querySelector('.ais-PoweredBy-logo')).toHaveClass(
      'MyCustomPoweredByLogo'
    );
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchTestWrapper>
        <PoweredBy
          className="MyPoweredBy"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyPoweredBy', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
