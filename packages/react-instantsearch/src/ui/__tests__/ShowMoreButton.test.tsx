/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ShowMoreButton } from '../ShowMoreButton';

const defaultTranslations = {
  showMoreButtonText({ isShowingMore }: { isShowingMore: boolean }) {
    return isShowingMore ? 'Show less' : 'Show more';
  },
};

describe('ShowMoreButton', () => {
  test('renders with props', () => {
    const { container } = render(
      <ShowMoreButton
        isShowingMore={false}
        translations={defaultTranslations}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Show more
        </button>
      </div>
    `);
  });

  test('changes the button label when is showing more', () => {
    const { container } = render(
      <ShowMoreButton isShowingMore={true} translations={defaultTranslations} />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button>
          Show less
        </button>
      </div>
    `);
  });

  test('calls an `onClick` callback when clicking the button', () => {
    const onClick = jest.fn();
    const { getByRole } = render(
      <ShowMoreButton
        isShowingMore={false}
        onClick={onClick}
        translations={defaultTranslations}
      />
    );

    userEvent.click(getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disables the button', () => {
    const onClick = jest.fn();
    const { container, getByRole } = render(
      <ShowMoreButton
        isShowingMore={false}
        disabled={true}
        onClick={onClick}
        translations={defaultTranslations}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          disabled=""
        >
          Show more
        </button>
      </div>
    `);

    userEvent.click(getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  test('renders translations', () => {
    const translations = {
      showMoreButtonText({ isShowingMore }: { isShowingMore: boolean }) {
        return isShowingMore ? 'Display less' : 'Display more';
      },
    };
    const { getByRole, rerender } = render(
      <ShowMoreButton isShowingMore translations={translations} />
    );

    expect(getByRole('button', { name: 'Display less' })).toBeInTheDocument();

    rerender(
      <ShowMoreButton isShowingMore={false} translations={translations} />
    );

    expect(getByRole('button', { name: 'Display more' })).toBeInTheDocument();
  });
});
