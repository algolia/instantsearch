/**
 * Assert that a function is actually a mocked function.
 */
export const castToJestMock = <TFunction extends (...args: any[]) => any>(
  func: TFunction
) => func as jest.MockedFunction<typeof func>;
