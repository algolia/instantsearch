/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render } from '@testing-library/react';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-core';

import { ChatTrigger } from '../ChatTrigger';

// `ChatTrigger`'s prop shape (extends `ComponentProps<'button'>`) widens the
// shared `SingleWidget` union enough to break TS narrowing in
// `all-components.test.tsx`'s parametrized cases, so it's excluded there and
// covered with the same className/root-attribute assertions here.
function renderInSearch(ui: React.ReactElement) {
  return render(
    <InstantSearch searchClient={createSearchClient({})} indexName="indexName">
      {ui}
    </InstantSearch>
  );
}

describe('ChatTrigger rendering', () => {
  test('sets root class name', () => {
    const { container } = renderInSearch(
      <ChatTrigger classNames={{ root: 'BASECLASS ROOTCLASS' }} />
    );

    expect(
      container.querySelector('.BASECLASS')!.classList.contains('ROOTCLASS')
    ).toEqual(true);
  });

  test('sets root html attribute', () => {
    const { container } = renderInSearch(
      <ChatTrigger classNames={{ root: 'BASECLASS' }} title="test title" />
    );

    expect(
      container.querySelector<HTMLButtonElement>('.BASECLASS')!.title
    ).toBe('test title');
  });
});
