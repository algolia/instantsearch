type RangeOptions = {
  start?: number;
  end: number;
  step?: number;
};

function range({ start = 0, end, step = 1 }: RangeOptions): number[] {
  // We can't divide by 0 so we re-assign the step to 1 if it happens.
  const limitStep = step === 0 ? 1 : step;

  // In some cases the array to create has a decimal length.
  // We therefore need to round the value.
  // Example:
  //   { start: 1, end: 5000, step: 500 }
  //   => Array length = (5000 - 1) / 500 = 9.998
  const arrayLength = Math.round((end - start) / limitStep);

  return [...Array(arrayLength)].map(
    (_, current) => start + current * limitStep
  );
}

export default range;
