import { getPropertyByPath } from '../object';

it('returns the value for top-level existing paths', () => {
  const obj = {
    hi: true,
  };

  expect(getPropertyByPath(obj, 'hi')).toBe(true);
});

it('returns undefined for top-level non-existing paths', () => {
  const obj = {
    something: true,
  };

  expect(getPropertyByPath(obj, 'hi')).toBe(undefined);
});

it('returns the value for deep level existing paths', () => {
  const obj = {
    hi: {
      yes: {
        I: {
          like: 'cats',
        },
      },
    },
  };

  expect(getPropertyByPath(obj, 'hi.yes.I.like')).toBe('cats');
});

it('returns undefined for deep level non-existing paths', () => {
  const obj = {
    hi: {
      yes: {
        I: {
          like: 'cats',
        },
      },
    },
  };

  expect(getPropertyByPath(obj, 'hi.yes.I.like.dogs')).toBe(undefined);
});

it('stops traversing if intermediary value is not an object', () => {
  const obj = {
    hi: {
      yes: {
        I: [{ like: 'cats' }],
      },
    },
  };

  expect(getPropertyByPath(obj, 'hi.yes.I.like')).toBe(undefined);
});
