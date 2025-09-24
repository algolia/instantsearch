/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Breadcrumb } from '../Breadcrumb';

import type { BreadcrumbProps } from '../Breadcrumb';

describe('Breadcrumb', () => {
  function createProps({
    translations,
    ...props
  }: Partial<BreadcrumbProps> = {}): BreadcrumbProps {
    const createURL = jest.fn((value) => `#${value}`);
    const onNavigate = jest.fn();

    return {
      items: [
        { label: 'Audio', value: 'Audio' },
        { label: 'Home audio', value: 'Home audio' },
      ],
      hasItems: true,
      createURL,
      onNavigate,
      separator: '>',
      translations: {
        rootElementText: 'Home',
        ...translations,
      },
      ...props,
    };
  }

  test('renders with props', () => {
    const props = createProps();
    const { container } = render(<Breadcrumb {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#null"
              >
                Home
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              <a
                class="ais-Breadcrumb-link"
                href="#Audio"
              >
                Audio
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              Home audio
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('renders with translations', () => {
    const props = createProps({
      translations: {
        rootElementText: 'Index',
      },
    });
    const { container } = render(<Breadcrumb {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#null"
              >
                Index
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              <a
                class="ais-Breadcrumb-link"
                href="#Audio"
              >
                Audio
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              Home audio
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('renders with custom separator', () => {
    const props = createProps({ separator: '/' });
    const { container } = render(<Breadcrumb {...props} />);

    expect(container.querySelectorAll('.ais-Breadcrumb-separator'))
      .toMatchInlineSnapshot(`
      NodeList [
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          /
        </span>,
        <span
          aria-hidden="true"
          class="ais-Breadcrumb-separator"
        >
          /
        </span>,
      ]
    `);
  });

  test('calls an `onNavigate` callback when selecting an item', () => {
    const props = createProps();
    render(<Breadcrumb {...props} />);

    userEvent.click(
      document.querySelector(
        '.ais-Breadcrumb-link[href="#Audio"]'
      ) as HTMLAnchorElement
    );

    expect(props.onNavigate).toHaveBeenCalledTimes(1);
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomBreadcrumb',
      classNames: {
        root: 'ROOT',
        noRefinementRoot: 'NOREFINEMENTROOT',
        list: 'LIST',
        item: 'ITEM',
        selectedItem: 'SELECTEDITEM',
        separator: 'SEPARATOR',
        link: 'LINK',
      },
    });
    const { container } = render(<Breadcrumb {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb ROOT MyCustomBreadcrumb"
        >
          <ul
            class="ais-Breadcrumb-list LIST"
          >
            <li
              class="ais-Breadcrumb-item ITEM"
            >
              <a
                class="ais-Breadcrumb-link LINK"
                href="#null"
              >
                Home
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ITEM"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator SEPARATOR"
              >
                &gt;
              </span>
              <a
                class="ais-Breadcrumb-link LINK"
                href="#Audio"
              >
                Audio
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ITEM ais-Breadcrumb-item--selected SELECTEDITEM"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator SEPARATOR"
              >
                &gt;
              </span>
              Home audio
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps();
    const { container } = render(
      <Breadcrumb title="Some custom title" {...props} />
    );

    expect(container.querySelector('.ais-Breadcrumb')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
