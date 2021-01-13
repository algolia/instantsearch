// https://stackoverflow.com/a/65117465/3185307

export const keys = Object.keys as <TObject extends {}>(
  yourObject: TObject
) => Array<keyof TObject>;

export const values = Object.values as <TObject extends {}>(
  yourObject: TObject
) => Array<TObject[keyof TObject]>;

type Entries<TObject> = {
  [TKey in keyof TObject]: [TKey, TObject[TKey]];
}[keyof TObject];
export const entries = Object.entries as <TObject extends {}>(
  yourObject: TObject
) => Array<Entries<TObject>>;

export const fromEntries = Object.fromEntries as <TKey extends string, TValue>(
  yourObjectEntries: Array<[TKey, TValue]>
) => Record<TKey, TValue>;
