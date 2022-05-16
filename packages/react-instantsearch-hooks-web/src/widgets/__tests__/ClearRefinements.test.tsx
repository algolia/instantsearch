import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  useCurrentRefinements,
  useRefinementList,
} from 'react-instantsearch-hooks';

import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { ClearRefinements } from '../ClearRefinements';

import type {
  UseRefinementListProps,
  UseCurrentRefinementsProps,
} from 'react-instantsearch-hooks';

describe('ClearRefinements', () => {
  test('renders with default props', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        }}
      >
        <RefinementList attribute="brand" />
        <ClearRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('renders with a disabled button when there are no refinements', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ClearRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    const button = document.querySelector('.ais-ClearRefinements-button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('ais-ClearRefinements-button--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('clears all refinements', async () => {
    const { container, queryAllByRole } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        }}
      >
        <RefinementList attribute="brand" />
        <CurrentRefinements />
        <ClearRefinements />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(1);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <span>
              brand
              :
            </span>
            <button>
              Apple
            </button>
          </li>
        </ul>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);

    userEvent.click(
      document.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(0);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul />
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('inclusively restricts what refinements to clear', async () => {
    const { container, queryAllByRole } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <RefinementList attribute="brand" />
        <RefinementList attribute="categories" />
        <CurrentRefinements />
        <ClearRefinements includedAttributes={['categories']} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(2);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <span>
              brand
              :
            </span>
            <button>
              Apple
            </button>
          </li>
          <li>
            <span>
              categories
              :
            </span>
            <button>
              Audio
            </button>
          </li>
        </ul>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);

    userEvent.click(
      document.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(1);
    expect(queryAllByRole('listitem')[0]).toHaveTextContent('brand:Apple');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <span>
              brand
              :
            </span>
            <button>
              Apple
            </button>
          </li>
        </ul>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('exclusively restricts what refinements to clear', async () => {
    const { container, queryAllByRole } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <RefinementList attribute="brand" />
        <RefinementList attribute="categories" />
        <CurrentRefinements />
        <ClearRefinements excludedAttributes={['categories']} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(2);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <span>
              brand
              :
            </span>
            <button>
              Apple
            </button>
          </li>
          <li>
            <span>
              categories
              :
            </span>
            <button>
              Audio
            </button>
          </li>
        </ul>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);

    userEvent.click(
      document.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(1);
    expect(queryAllByRole('listitem')[0]).toHaveTextContent('categories:Audio');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <span>
              categories
              :
            </span>
            <button>
              Audio
            </button>
          </li>
        </ul>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('restricts what refinements to clear with custom logic', async () => {
    const { container, queryAllByRole } = render(
      <InstantSearchHooksTestWrapper
        initialUiState={{
          indexName: {
            refinementList: {
              brand: ['Apple'],
              categories: ['Audio'],
            },
          },
        }}
      >
        <RefinementList attribute="brand" />
        <RefinementList attribute="categories" />
        <CurrentRefinements />
        <ClearRefinements
          transformItems={(items) => items.filter((item) => item !== 'brand')}
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(2);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <span>
              brand
              :
            </span>
            <button>
              Apple
            </button>
          </li>
          <li>
            <span>
              categories
              :
            </span>
            <button>
              Audio
            </button>
          </li>
        </ul>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);

    userEvent.click(
      document.querySelector(
        '.ais-ClearRefinements-button'
      ) as HTMLButtonElement
    );

    await wait(0);

    expect(queryAllByRole('listitem')).toHaveLength(1);
    expect(queryAllByRole('listitem')[0]).toHaveTextContent('brand:Apple');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <span>
              brand
              :
            </span>
            <button>
              Apple
            </button>
          </li>
        </ul>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper>
        <ClearRefinements
          className="MyClearsRefinements"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyClearsRefinements', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});

function CurrentRefinements(props: UseCurrentRefinementsProps) {
  const { items } = useCurrentRefinements(props);

  return (
    <ul>
      {items.map((item) => (
        <li key={item.attribute}>
          <span>{item.attribute}:</span>
          {item.refinements.map(({ label }) => (
            <button key={label}>{label}</button>
          ))}
        </li>
      ))}
    </ul>
  );
}

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);

  return null;
}
