/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';

import { getAllWidgets } from './__utils__/all-widgets';

describe('rendering', () => {
  const widgets = getAllWidgets();

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
        <Component classNames={{ root: 'BASECLASS' }} />
      );

      expect(container.querySelector<HTMLDivElement>('.BASECLASS')).toBeTruthy();
    });
  });
});
