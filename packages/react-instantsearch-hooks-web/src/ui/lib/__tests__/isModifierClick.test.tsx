/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { isModifierClick } from '../isModifierClick';

describe('isModifierClick', () => {
  test('returns `true` when holding the middle button', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    userEvent.click(getByRole('button'), { button: 1 });

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Alt key', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    userEvent.click(getByRole('button'), { altKey: true });

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Ctrl key', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    userEvent.click(getByRole('button'), { ctrlKey: true });

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Meta key', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    userEvent.click(getByRole('button'), { metaKey: true });

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Shift key', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    userEvent.click(getByRole('button'), { shiftKey: true });

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `false` when not holding any key', () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    userEvent.click(getByRole('button'));

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(false);
  });
});
