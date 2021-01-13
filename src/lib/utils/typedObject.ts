// https://stackoverflow.com/a/65117465/3185307

export const keys = Object.keys as <TObject extends {}>(
  yourObject: TObject
) => Array<keyof TObject>;
