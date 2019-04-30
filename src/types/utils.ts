/* eslint-disable-next-line @typescript-eslint/generic-type-naming */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
