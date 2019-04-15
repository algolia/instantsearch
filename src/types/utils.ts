export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
