/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import React from 'react';

import { getAllWidgets } from './__utils__/all-widgets';

describe('rendering', () => {
  const widgets = getAllWidgets();

  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

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
