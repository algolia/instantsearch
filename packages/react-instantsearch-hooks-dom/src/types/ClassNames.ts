/**
 * Map from CSS classes used in UI components to the `classNames` API exposed to users
 */
export type ClassNames<TProps extends { classNames: Record<string, string> }> =
  Omit<TProps, 'classNames'> & { classNames?: Partial<TProps['classNames']> };
