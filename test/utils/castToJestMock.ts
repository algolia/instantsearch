export const castToJestMock = <T extends (...args: any[]) => any>(obj: T) =>
  obj as jest.MockedFunction<typeof obj>;
