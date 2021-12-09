import configure from '../configure';

describe('configure', () => {
  test('throws without options', () => {
    const trigger = () => {
      // @ts-expect-error
      configure();
    };

    // We check that it throws at the widget level
    // but assert the error message only in the connector.
    expect(trigger).toThrow();
  });

  test('does not throw with empty search parameters', () => {
    const trigger = () => {
      configure({});
    };

    expect(trigger).not.toThrow();
  });

  test('does not throw with search parameters', () => {
    const trigger = () => {
      configure({
        analytics: true,
      });
    };

    expect(trigger).not.toThrow();
  });
});
