import * as React from 'react';

type Use = <T>(promise: Promise<T>) => T;
const useKey = 'use' as keyof typeof React;

// @TODO: Remove this file and import directly from React when available.
export const use = React[useKey] as Use;
