import cx from 'classnames';

export const createClassNames =
  (block: string, prefix = 'ais') =>
  (...elements: string[]) => {
    const suitElements = elements
      .filter((element) => element || element === '')
      .map((element) => {
        const baseClassName = `${prefix}-${block}`;

        return element ? `${baseClassName}-${element}` : baseClassName;
      });

    return cx(suitElements);
  };

export const isSpecialClick = (event: MouseEvent) => {
  const isMiddleClick = event.button === 1;
  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
};

export const capitalize = (key: string) =>
  key.length === 0 ? '' : `${key[0].toUpperCase()}${key.slice(1)}`;

type RangeOptions = {
  start?: number;
  end: number;
  step?: number;
};

// taken from InstantSearch.js/utils
export function range({ start = 0, end, step = 1 }: RangeOptions): number[] {
  // We can't divide by 0 so we re-assign the step to 1 if it happens.
  const limitStep = step === 0 ? 1 : step;

  // In some cases the array to create has a decimal length.
  // We therefore need to round the value.
  // Example:
  //   { start: 1, end: 5000, step: 500 }
  //   => Array length = (5000 - 1) / 500 = 9.998
  const arrayLength = Math.round((end - start) / limitStep);

  return [...Array(arrayLength)].map(
    (_, current) => (start + current) * limitStep
  );
}

export function find<TItem = any>(
  array: TItem[],
  comparator: (item: TItem) => boolean
): TItem | undefined {
  if (!Array.isArray(array)) {
    return undefined;
  }

  for (let i = 0; i < array.length; i++) {
    if (comparator(array[i])) {
      return array[i];
    }
  }
  return undefined;
}
