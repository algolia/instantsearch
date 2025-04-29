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
        <Component className="BASECLASS" classNames={{ root: 'ROOTCLASS' }} />
      );

      expect(
        container.querySelector('.BASECLASS')!.classList.contains('ROOTCLASS')
      ).toEqual(true);
    });
  });

  describe('root element props', () => {
    test.each(widgets)('set root html attribute $name', ({ Component }) => {
      const { container } = render(
        <Component className="BASECLASS" title="test title" />
      );

      expect(container.querySelector<HTMLDivElement>('.BASECLASS')!.title).toBe(
        'test title'
      );
    });
  });
});
