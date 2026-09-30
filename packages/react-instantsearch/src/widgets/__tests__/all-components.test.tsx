/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import React from 'react';

import { getAllWidgets } from './__utils__/all-widgets';

describe('rendering', () => {
  // `ResultCard` renders nothing until a Rule enables it in the results, so
  // its root assertions live in `ResultCard.test.tsx` with such a response.
  const widgets = getAllWidgets().filter(({ name }) => name !== 'ResultCard');

  describe('className', () => {
    test.each(widgets)('sets root class name $name', ({ Component }) => {
      const { container } = render(
        <Component classNames={{ root: 'BASECLASS ROOTCLASS' }} />
      );

      expect(
        container.querySelector('.BASECLASS')!.classList.contains('ROOTCLASS')
      ).toEqual(true);
    });
  });

  describe('root element props', () => {
    test.each(widgets)('set root html attribute $name', ({ Component }) => {
      const { container } = render(
        <Component classNames={{ root: 'BASECLASS' }} title="test title" />
      );

      expect(container.querySelector<HTMLDivElement>('.BASECLASS')!.title).toBe(
        'test title'
      );
    });
  });
});
