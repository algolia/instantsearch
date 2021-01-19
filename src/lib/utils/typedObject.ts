/**
 * A typed version of Object.keys, to use when looping over a static object
 * inspired from https://stackoverflow.com/a/65117465/3185307
 */
export const keys = Object.keys as <TObject extends {}>(
  yourObject: TObject
) => Array<keyof TObject>;
